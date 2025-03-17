1. i want to create (RBAC PROJECT) using react,material ui, firebase, 
2. the project contains Admin,Sub-Admin & User and after log in each one have different access
3. (1) --> Admin --> 1. All routes can be accessed 
                     2. The new user's who registerd and log in there mail and password can be seen in the form      of   list to admin's dashboard
                     2. Admin can perform CRUD operations on user's list & Sub - Admin 
                     3. Admin can add/delete/update the permissions to all sections
4. (2) --> Sub - Admin --> 1. Sub Admin can access all routes but not admin routes
                           2. Sub Admin can add edit / delete / update the permissions to all sections if he has pemissions from the admin user.
                           3.CRUD on user's.
4. (3) --> User ---> 1. User's can register & log in only
5. the admin are fix and after log in show the admin's name in dashbard welcome admin 


6. this is my firebase schema : ->
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC8UV-CpdNaEKX70nElUeEQFEXvDWePo58",
  authDomain: "banking-rbac.firebaseapp.com",
  projectId: "banking-rbac",
  storageBucket: "banking-rbac.firebasestorage.app",
  messagingSenderId: "446968623535",
  appId: "1:446968623535:web:93d9be65fd98f26426ff5a",
  measurementId: "G-HSXBLPQ2M1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

7. and suggest me the what rules to give in the firestore firebase
8. first explain me the folder structure and give me what installatin (dependencies i have to do in the react) and 
please do write the each component seprately and properly that define in the folder structure and please do write the each component
