import {
  GoogleSignin,
  GoogleAuthProvider,
  signInWithCredential,
  auth,
} from "./firebase";

class GoogleAuthService {
  async signInWithGoogle() {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the users ID token
      const userInfo = await GoogleSignin.signIn();

      console.log("Google Sign-In userInfo:", userInfo);

      // Check if we have the required tokens - FIX: access correct path
      if (!userInfo.data?.idToken) {
        throw new Error("No ID token received from Google Sign-In");
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(
        userInfo.data.idToken
      );

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseIdToken = await userCredential.user.getIdToken();
      return {
        firebaseIdToken,
        userInfo: userInfo.data.user,
      };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }

  async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth.signOut();
    } catch (error) {
      console.error("Google Sign-Out Error:", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      return userInfo;
    } catch (error) {
      console.log("No user signed in silently");
      return null;
    }
  }

  async isSignedIn() {
    return await GoogleSignin.isSignedIn();
  }
}

export default new GoogleAuthService();
