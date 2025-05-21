import { useState, useRef, useEffect } from 'react';
import { ProfileMetadata, ProfileAttribute, MetadataAttributeType } from '@/lib/lensClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, X, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileMetadataEditorProps {
  initialMetadata?: ProfileMetadata;
  onSave: (metadata: ProfileMetadata) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export default function ProfileMetadataEditor({
  initialMetadata,
  onSave,
  isLoading = false,
  className,
}: ProfileMetadataEditorProps) {
  const [metadata, setMetadata] = useState<ProfileMetadata>(
    initialMetadata || {
      name: '',
      bio: '',
      attributes: [],
    }
  );
  const [activeTab, setActiveTab] = useState('profile');
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeType, setNewAttributeType] = useState<MetadataAttributeType>(MetadataAttributeType.STRING);
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Set previews based on initial metadata
  useEffect(() => {
    if (initialMetadata?.picture) {
      setImagePreview(initialMetadata.picture);
    }
    if (initialMetadata?.coverPicture) {
      setCoverPreview(initialMetadata.coverPicture);
    }
  }, [initialMetadata]);

  const handleProfileChange = (key: keyof ProfileMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddAttribute = () => {
    if (!newAttributeKey.trim()) {
      toast({
        title: 'Error',
        description: 'Attribute key is required',
        variant: 'destructive',
      });
      return;
    }

    if (!newAttributeValue.trim()) {
      toast({
        title: 'Error',
        description: 'Attribute value is required',
        variant: 'destructive',
      });
      return;
    }

    const newAttribute: ProfileAttribute = {
      key: newAttributeKey,
      type: newAttributeType,
      value: newAttributeValue,
    };

    setMetadata((prev) => ({
      ...prev,
      attributes: [...(prev.attributes || []), newAttribute],
    }));

    // Reset form
    setNewAttributeKey('');
    setNewAttributeValue('');
    setNewAttributeType(MetadataAttributeType.STRING);

    toast({
      title: 'Attribute added',
      description: `Added ${newAttributeKey} attribute to your profile`,
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!metadata.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Profile name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(metadata);
      toast({
        title: 'Success',
        description: 'Profile metadata saved successfully',
      });
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile metadata',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleProfileImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProfileImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleCoverImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCoverImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleProfileImageChange = (file: File) => {
    // In a real app, you would upload this to IPFS and get a URI
    // For demo purposes, we'll use a local URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setMetadata((prev) => ({
        ...prev,
        // In a real app, this would be an IPFS URI like lens://...
        picture: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageChange = (file: File) => {
    // In a real app, you would upload this to IPFS and get a URI
    // For demo purposes, we'll use a local URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      setMetadata((prev) => ({
        ...prev,
        // In a real app, this would be an IPFS URI like lens://...
        coverPicture: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isProfileImage: boolean) => {
    if (e.target.files && e.target.files[0]) {
      if (isProfileImage) {
        handleProfileImageChange(e.target.files[0]);
      } else {
        handleCoverImageChange(e.target.files[0]);
      }
    }
  };

  const triggerFileInput = (isProfileImage: boolean) => {
    if (isProfileImage && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (!isProfileImage && coverInputRef.current) {
      coverInputRef.current.click();
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="gradient-text">Lens Profile Metadata</span>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        </CardTitle>
        <CardDescription>
          Customize how your profile appears on Lens Protocol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="relative overflow-hidden group">
              <span>Profile Info</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
            </TabsTrigger>
            <TabsTrigger value="attributes" className="relative overflow-hidden group">
              <span>Attributes</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300"></span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                value={metadata.name || ''}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Your name on Lens"
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={metadata.bio || ''}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                placeholder="Tell the world about yourself..."
                className="min-h-24 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50",
                    dragActive ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-800"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleProfileImageDrop(e)}
                  onClick={() => triggerFileInput(true)}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, true)}
                  />

                  <div className="flex flex-col items-center justify-center py-4">
                    {imagePreview ? (
                      <div className="relative w-28 h-28 mb-2">
                        <img 
                          src={imagePreview} 
                          alt="Profile preview" 
                          className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md animate-fade-in"
                        />
                        <div 
                          className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                            setMetadata((prev) => ({ ...prev, picture: undefined }));
                          }}
                        >
                          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="text-sm text-center text-gray-500">
                      {imagePreview ? "Change picture" : "Drop an image here or click to upload"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50",
                    dragActive ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-800"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleCoverImageDrop(e)}
                  onClick={() => triggerFileInput(false)}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileInputChange(e, false)}
                  />

                  <div className="flex flex-col items-center justify-center py-4">
                    {coverPreview ? (
                      <div className="relative w-full h-28 mb-2">
                        <img 
                          src={coverPreview} 
                          alt="Cover preview" 
                          className="w-full h-28 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in"
                        />
                        <div 
                          className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverPreview(null);
                            setMetadata((prev) => ({ ...prev, coverPicture: undefined }));
                          }}
                        >
                          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="text-sm text-center text-gray-500">
                      {coverPreview ? "Change cover image" : "Drop an image here or click to upload"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attributes" className="mt-4 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Attribute</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="attr-key" className="text-xs">Key</Label>
                  <Input
                    id="attr-key"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    placeholder="e.g., twitter, website, etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="attr-type" className="text-xs">Type</Label>
                  <Select value={newAttributeType} onValueChange={(val) => setNewAttributeType(val as MetadataAttributeType)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MetadataAttributeType.STRING}>String</SelectItem>
                      <SelectItem value={MetadataAttributeType.NUMBER}>Number</SelectItem>
                      <SelectItem value={MetadataAttributeType.DATE}>Date</SelectItem>
                      <SelectItem value={MetadataAttributeType.BOOLEAN}>Boolean</SelectItem>
                      <SelectItem value={MetadataAttributeType.JSON}>JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="attr-value" className="text-xs">Value</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="attr-value"
                      value={newAttributeValue}
                      onChange={(e) => setNewAttributeValue(e.target.value)}
                      placeholder="Attribute value"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddAttribute}
                      className="group relative overflow-hidden"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      <span>Add</span>
                      <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Attribute List */}
            <div className="space-y-4 mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {metadata.attributes && metadata.attributes.length > 0 
                  ? `Current Attributes (${metadata.attributes.length})` 
                  : "No attributes yet"}
              </h3>
              
              <div className="space-y-2">
                {metadata.attributes && metadata.attributes.map((attr, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {attr.type}
                      </div>
                      <div className="font-medium">{attr.key}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm overflow-hidden text-ellipsis max-w-[150px]">
                        {attr.value}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveAttribute(index)}
                      className="text-gray-500 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50/50 dark:bg-gray-900/50 px-6 py-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setActiveTab(activeTab === 'profile' ? 'attributes' : 'profile');
          }}
        >
          {activeTab === 'profile' ? 'Next: Attributes' : 'Back to Profile'}
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="relative overflow-hidden group"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save Profile Metadata
              <span className="absolute bottom-0 left-0 w-full h-full bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Add animation styles
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.gradient-text {
  background: linear-gradient(to right, #00BFFF, #A020F0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`;

// Add styles to document when this component is used
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.innerText = styles;
  if (!document.querySelector('style[data-lens-styles]')) {
    styleElement.setAttribute('data-lens-styles', 'true');
    document.head.appendChild(styleElement);
  }
} 