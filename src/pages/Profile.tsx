
import Header from "@/components/Header";
import UserProfileComponent from "@/components/UserProfile/UserProfileComponent";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="page-container pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              Track your progress and customize your learning experience
            </p>
          </div>
          
          <UserProfileComponent />
        </div>
      </main>
      
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container-inner text-center text-sm text-muted-foreground">
          <p>© 2024 VocabGuru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;
