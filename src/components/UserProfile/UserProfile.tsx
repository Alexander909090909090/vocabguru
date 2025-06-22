
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, BookOpen, Target, Calendar } from "lucide-react";
import { toast } from "sonner";
import { UserProfileService, UserProfile } from "@/services/userProfileService";

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    learning_level: 'intermediate',
    daily_goal: 10
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      let userProfile = await UserProfileService.getUserProfile(user.id);
      
      if (!userProfile) {
        // Create default profile if none exists
        userProfile = await UserProfileService.createUserProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          username: user.email?.split('@')[0] || null,
          learning_level: 'intermediate',
          daily_goal: 10
        });
      }

      if (userProfile) {
        setProfile(userProfile);
        setEditForm({
          full_name: userProfile.full_name || '',
          username: userProfile.username || '',
          learning_level: userProfile.learning_level,
          daily_goal: userProfile.daily_goal
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?.id) return;

    try {
      const updatedProfile = await UserProfileService.updateUserProfile(user.id, editForm);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const progressToNextLevel = (profile.total_words_learned % 100);
  const currentLevel = Math.floor(profile.total_words_learned / 100) + 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name || 'Vocabulary Scholar'}</h2>
              <p className="text-muted-foreground">@{profile.username || 'user'}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  maxLength={30}
                />
              </div>
              <div>
                <Label htmlFor="learning_level">Learning Level</Label>
                <select 
                  id="learning_level"
                  value={editForm.learning_level}
                  onChange={(e) => setEditForm({...editForm, learning_level: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <Label htmlFor="daily_goal">Daily Goal (words)</Label>
                <Input
                  id="daily_goal"
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.daily_goal}
                  onChange={(e) => setEditForm({...editForm, daily_goal: parseInt(e.target.value) || 1})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{profile.total_words_learned}</div>
                  <div className="text-xs text-muted-foreground">Words Learned</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold">{profile.streak_count}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{profile.daily_goal}</div>
                  <div className="text-xs text-muted-foreground">Daily Goal</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{currentLevel}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{progressToNextLevel}/100</span>
                </div>
                <Progress value={progressToNextLevel} className="h-2" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Learning Level</h3>
                <Badge variant="secondary" className="capitalize">
                  {profile.learning_level}
                </Badge>
              </div>

              {profile.achievements && profile.achievements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.achievements.map((achievement, index) => (
                      <Badge key={index} variant="outline">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;
