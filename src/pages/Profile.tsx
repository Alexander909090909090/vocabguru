
import { PersonalizedDashboard } from "@/components/PersonalizedDashboard/PersonalizedDashboard";
import { UserProfileComponent } from "@/components/UserProfile/UserProfileComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <PersonalizedDashboard />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <UserProfileComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
