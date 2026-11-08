import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore();

/**
 * Callable Function: createStaffAccount
 * Creates staff Firebase Auth user server-side and assigns custom claims / roles
 * Only callable by authenticated Super Admin
 */
export const createStaffAccount = functions.https.onCall(async (data, context) => {
  // 1. Verify caller authentication & Super Admin role
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The caller must be authenticated.'
    );
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection('userProfiles').doc(callerUid).get();
  const callerData = callerSnap.data();

  if (!callerData || callerData.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only a Super Admin is authorized to create privileged staff accounts.'
    );
  }

  const { email, password, displayName, role, department, doctorId, staffId } = data;

  if (!email || !password || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email, temporary password, and assigned role are mandatory.'
    );
  }

  try {
    // 2. Create Auth User
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });

    // 3. Assign Custom Claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      department: department || 'General'
    });

    // 4. Create User Profile Document
    const profile = {
      uid: userRecord.uid,
      email,
      displayName,
      role,
      department: department || 'General',
      doctorId: doctorId || null,
      staffId: staffId || null,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('userProfiles').doc(userRecord.uid).set(profile);

    // 5. Authoritative Audit Log
    await db.collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      userEmail: callerData.email,
      userName: callerData.displayName,
      userRole: 'Super Admin',
      action: 'Staff Account Created',
      module: 'Staff',
      targetId: userRecord.uid,
      details: `Created login account for ${displayName} (${email}) with role: ${role}`
    });

    return { success: true, uid: userRecord.uid };
  } catch (err: any) {
    throw new functions.https.HttpsError('internal', err.message);
  }
});

/**
 * Callable Function: verifyPaymentServerSide
 * Authoritatively marks bank transfer as approved and issues immutable receipt
 */
export const verifyPaymentServerSide = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated');
  }

  const callerSnap = await db.collection('userProfiles').doc(context.auth.uid).get();
  const caller = callerSnap.data();

  if (!caller || (caller.role !== 'accountant' && caller.role !== 'super_admin')) {
    throw new functions.https.HttpsError('permission-denied', 'Unauthorized to verify payments');
  }

  const { submissionId, approved, rejectionReason } = data;

  const subRef = db.collection('paymentSubmissions').doc(submissionId);
  const subSnap = await subRef.get();

  if (!subSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Payment submission not found');
  }

  const sub = subSnap.data()!;

  const batch = db.batch();

  if (approved) {
    const receiptNumber = `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    batch.update(subRef, {
      status: 'Approved',
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: caller.displayName
    });

    // Update appointment
    const aptRef = db.collection('appointments').doc(sub.appointmentId);
    batch.update(aptRef, {
      paymentStatus: 'Paid',
      paidAmount: sub.amountPaid,
      paymentMethod: 'Bank Transfer',
      paymentReference: sub.transactionReference,
      paymentReceiptNumber: receiptNumber,
      paymentReceivedBy: caller.displayName,
      status: 'Confirmed'
    });

    // Create payment transaction
    const paymentRef = db.collection('payments').doc();
    batch.set(paymentRef, {
      id: paymentRef.id,
      receiptNumber,
      appointmentId: sub.appointmentId,
      bookingReference: sub.bookingReference,
      patientName: sub.patientName,
      amount: sub.amountPaid,
      paymentMethod: 'Bank Transfer',
      type: 'Consultation Fee',
      recordedBy: caller.email,
      recordedByName: caller.displayName,
      timestamp: new Date().toISOString(),
      status: 'Finalized'
    });
  } else {
    batch.update(subRef, {
      status: 'Rejected',
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: caller.displayName,
      rejectionReason: rejectionReason || 'Payment details could not be verified'
    });

    const aptRef = db.collection('appointments').doc(sub.appointmentId);
    batch.update(aptRef, {
      paymentStatus: 'Rejected'
    });
  }

  await batch.commit();
  return { success: true };
});
