import admin, { firestore } from "firebase-admin";

// Update these 
const COLLECTION_NAME = "collection"
const FIELD_NAME = "field";
const CREDENTIAL_FILE_RELATIVE_PATH = "[PATH TO CREDENTIALS]"
const DATABASE_URL = "https://[DATABASE].firebaseio.com"
const PROJECT_ID = "[PROJECT ID]"

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(CREDENTIAL_FILE_RELATIVE_PATH),
    databaseURL: DATABASE_URL,
    projectId: PROJECT_ID,
});

async function repro() {
    const noOrderBy = await firebaseApp.firestore().collection(COLLECTION_NAME).limit(1).get();
    const noOrderByLastDoc = noOrderBy.docs.at(-1)!;

    // 1 doc, as expected
    const noOrderByNextPageWithSnapshot = await firebaseApp
        .firestore()
        .collection(COLLECTION_NAME)
        .limit(1)
        .orderBy(firestore.FieldPath.documentId())
        .startAfter(noOrderByLastDoc)
        .get();

    console.log(noOrderByNextPageWithSnapshot.size === 1);

    // 1 doc, as expected
    const noOrderByNextPageWithRef = await firebaseApp
        .firestore()
        .collection(COLLECTION_NAME)
        .limit(1)
        .orderBy(firestore.FieldPath.documentId())
        .startAfter(noOrderByLastDoc.ref)
        .get();

    console.log(noOrderByNextPageWithRef.size === 1);

    // WITH ORDER BY FIELD
    const withOrderBy = await firebaseApp
        .firestore()
        .collection(COLLECTION_NAME)
        .orderBy(FIELD_NAME)
        .limit(1)
        .orderBy(firestore.FieldPath.documentId())
        .get();

    const withOrderByLastDoc = withOrderBy.docs.at(-1)!;

    // Returns 1 doc, as expected
    const withOrderByNextPageWithSnapshot = await firebaseApp
        .firestore()
        .collection(COLLECTION_NAME)
        .orderBy(FIELD_NAME)
        .limit(1)
        .orderBy(firestore.FieldPath.documentId())
        .startAfter(withOrderByLastDoc)
        .get();

    console.log(withOrderByNextPageWithSnapshot.size === 1);

    // Returns no docs!
    const withOrderByNextPageWithRef = await firebaseApp
        .firestore()
        .collection(COLLECTION_NAME)
        .orderBy(FIELD_NAME)
        .limit(1)
        .orderBy(firestore.FieldPath.documentId())
        .startAfter(withOrderByLastDoc.ref)
        .get();

    console.log(withOrderByNextPageWithRef.size === 1);
}

repro().catch(console.error);

// Expected (incorrect) output:
// true
// true
// true
// false
