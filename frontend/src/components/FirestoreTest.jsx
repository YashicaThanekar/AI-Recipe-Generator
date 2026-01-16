import { useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore Connection Test Component
 * Add this temporarily to your Home page to test if Firestore is working
 * 
 * Usage: Import and add <FirestoreTest user={user} /> in Home.jsx
 */
function FirestoreTest({ user }) {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestore = async () => {
    if (!user) {
      setTestResult('❌ Error: No user logged in. Please sign in first.');
      return;
    }

    setLoading(true);
    setTestResult('🔄 Testing Firestore connection...');

    try {
      console.log('🧪 Starting Firestore test for user:', user.uid);

      // Test 1: Write to Firestore
      console.log('Test 1: Writing test document...');
      const testData = {
        test: true,
        message: 'Firestore test write',
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        userId: user.uid
      };

      const docRef = await addDoc(collection(db, `users/${user.uid}/test`), testData);
      console.log('✅ Test write successful! Doc ID:', docRef.id);

      // Test 2: Read from Firestore
      console.log('Test 2: Reading test documents...');
      const snapshot = await getDocs(collection(db, `users/${user.uid}/test`));
      console.log('✅ Test read successful! Found', snapshot.docs.length, 'documents');

      setTestResult(`
✅ Firestore is working correctly!

Write Test: Success (Doc ID: ${docRef.id})
Read Test: Success (${snapshot.docs.length} documents found)

User ID: ${user.uid}
Database: Connected
Permissions: OK

You can now:
1. Generate recipes
2. Save to history
3. Save to favorites

Check the console (F12) for detailed logs.
      `);

    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorHelp = '';
      if (error.code === 'permission-denied') {
        errorHelp = `
🔧 Fix: Update Firestore security rules
1. Go to Firebase Console
2. Click Firestore Database > Rules
3. Copy rules from firestore.rules file
4. Click Publish
        `;
      } else if (error.code === 'not-found') {
        errorHelp = `
🔧 Fix: Enable Firestore
1. Go to Firebase Console
2. Click Firestore Database
3. Click "Create database"
4. Choose production mode
        `;
      }

      setTestResult(`
❌ Firestore test failed!

Error Code: ${error.code}
Error: ${error.message}

${errorHelp}

See console (F12) for more details.
      `);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show if not logged in
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '1rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 9998,
      maxWidth: '400px'
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#764ba2' }}>
        🧪 Firestore Test
      </h4>
      
      <button
        onClick={testFirestore}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        {loading ? '⏳ Testing...' : '🧪 Test Firestore Connection'}
      </button>

      {testResult && (
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          margin: 0,
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
}

export default FirestoreTest;
