// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, ModalInput, Platform, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { Button, PrimaryButton, SecondaryButton, DestructiveButton, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { useLicenseVerificationStore } from '@/stores/license-verification-store';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';
import { FileText, Camera, Trash2, Check, X, Upload } from 'lucide-react-native';
  const DOCUMENT_TYPES = [
  { value: 'drivers_license', label: "Driver's License", required: true },
  { value: 'national_id', label: 'National ID', required: true },
  { value: 'vehicle_registration', label: 'Vehicle Registration', required: false },
] as const;

export default function LicenseVerificationScreen() { const colors = useColors();
  const { documents,
    verificationStatus,
    uploadDocument,
    deleteDocument,
    simulateReview,
    loadDocuments} = useLicenseVerificationStore();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<'drivers_license' | 'national_id' | 'vehicle_registration'>('drivers_license');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => { loadDocuments(); }, []);
  const handleHaptic = (style = Haptics.ImpactFeedbackStyle.Light) =>  {
    if (Platform.OS !== 'web') { Haptics.impactAsync(style); } };
  const requestPermission = async () => { const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { toast.info('Please grant camera roll permission to upload documents.');
      return false; }
    return true; };
  const pickImage = async (side: 'front' | 'back') => { const hasPermission = await requestPermission();
    if (!hasPermission) return;
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8});

    if (!result.canceled && result.assets[0])  {
    if (side === 'front') { setFrontImage(result.assets[0].uri); } else { setBackImage(result.assets[0].uri); }
      handleHaptic(); } };
  const handleUpload = async () =>  {
    if (!frontImage || !documentNumber.trim() || !expiryDate.trim()) { toast.error('Please provide all required fields.');
      return; }
  const [year, month, day] = expiryDate.split('-').map(Number);
  const expiry = new Date(year, month - 1, day);

    handleHaptic(Haptics.ImpactFeedbackStyle.Medium);

    await uploadDocument({ type: selectedType,
      frontImageUri: frontImage,
      backImageUri: backImage || undefined,
      documentNumber,
      expiryDate: expiry});

    setFrontImage(null);
    setBackImage(null);
    setDocumentNumber('');
    setExpiryDate('');
    setUploadModalVisible(false);

    toast.success('Document uploaded successfully. It will be reviewed within 24 hours.'); };
  const handleDelete = async (id: string) => { toast.info(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete',
          style: 'destructive',
          onPress: async () => { handleHaptic(Haptics.ImpactFeedbackStyle.Heavy);
            await deleteDocument(id); }},
      ]
    ); };
  const handleSimulateReview = async (id: string, approved: boolean) => { handleHaptic(Haptics.ImpactFeedbackStyle.Medium);
    await simulateReview(
      id,
      approved,
      approved ? undefined : 'Document image is unclear. Please upload a clearer photo.'
    );
    toast.info(
      approved ? 'Document Approved' : 'Document Rejected',
      approved
        ? 'Your document has been approved.'
        : 'Your document was rejected. Please upload a new one.'
    ); };
  const getStatusType = (status: string): 'success' | 'warning' | 'error' | 'neutral' => { switch (status) { case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'neutral'; } };
  const getStatusIcon = (status: string) => { switch (status) { case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📄'; } };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView 
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-1">
          <Text variant="h2" weight="bold" className="text-foreground">
            License Verification
          </Text>
          <Text variant="body" className="text-muted">
            Upload your documents to start delivering
          </Text>
        </View>

        {/* Overall Status Card */}
        <View className={cn(
          'flex-row items-center gap-3 p-4 rounded-xl',
          verificationStatus === 'approved' && 'bg-success/20',
          verificationStatus === 'pending' && 'bg-warning/20',
          verificationStatus === 'rejected' && 'bg-error/20',
          verificationStatus === 'not_started' && 'bg-surface'
        )}>
          <Text className="text-2xl">{getStatusIcon(verificationStatus)}</Text>
          <View className="flex-1">
            <Text variant="caption" className={cn(
              verificationStatus === 'approved' && 'text-success',
              verificationStatus === 'pending' && 'text-warning',
              verificationStatus === 'rejected' && 'text-error',
              verificationStatus === 'not_started' && 'text-muted'
            )}>
              Verification Status
            </Text>
            <Text variant="body" weight="semibold" className={cn(
              verificationStatus === 'approved' && 'text-success',
              verificationStatus === 'pending' && 'text-warning',
              verificationStatus === 'rejected' && 'text-error',
              verificationStatus === 'not_started' && 'text-foreground'
            )}>
              {verificationStatus === 'not_started' && 'Not Started'}
              {verificationStatus === 'pending' && 'Under Review'}
              {verificationStatus === 'approved' && 'Approved'}
              {verificationStatus === 'rejected' && 'Rejected - Resubmit Required'}
            </Text>
          </View>
        </View>

        {/* Required Documents Checklist */}
        <View className="gap-3">
          <Text variant="body" weight="semibold" className="text-foreground">
            Required Documents
          </Text>
          {DOCUMENT_TYPES.map((docType) => { const uploaded = documents.find((d) => d.type === docType.value);
  const isComplete = uploaded && uploaded.status === 'approved';

            return (
              <Card key={docType.value} variant="flat" padding="md">
                <View className="flex-row items-center gap-3">
                  <View className={cn(
                    'w-10 h-10 rounded-full items-center justify-center',
                    isComplete ? 'bg-success/20' : 'bg-surface'
                  )}>
                    {isComplete ? (
                      <Check size={20} color={colors.success} />
                    ) : (
                      <FileText size={20} color={colors.muted} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text variant="body" weight="medium" className="text-foreground">
                      {docType.label}
                    </Text>
                    <Text variant="caption" className="text-muted">
                      {docType.required ? 'Required' : 'Optional'}
                    </Text>
                  </View>
                  {uploaded ? (
                    <StatusBadge 
                      status={getStatusType(uploaded.status)} 
                      label={uploaded.status} 
                    />
                  ) : (
                    <Button
                      title="Upload"
                      onPress={() => { handleHaptic();
                        setSelectedType(docType.value);
                        setUploadModalVisible(true); }}
                      size="sm"
                      variant="outline"
                    />
                  )}
                </View>
              </Card>
            ); })}
        </View>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <View className="gap-3">
            <Text variant="body" weight="semibold" className="text-foreground">
              Uploaded Documents
            </Text>
            {documents.map((doc) => (
              <Card key={doc.id} variant="flat" padding="md">
                <View className="flex-row gap-3 mb-3">
                  <Image
                    source={{ uri: doc.frontImageUri }}
                    className="w-20 h-14 rounded-lg bg-surface"
                  />
                  <View className="flex-1">
                    <Text variant="body" weight="medium" className="text-foreground">
                      {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label}
                    </Text>
                    <Text variant="caption" className="text-muted">
                      #{doc.documentNumber}
                    </Text>
                    <StatusBadge 
                      status={getStatusType(doc.status)} 
                      label={doc.status}
                      size="sm"
                    />
                  </View>
                  <IconButton
                    icon={<Trash2 size={18} color={colors.error} />}
                    onPress={() => handleDelete(doc.id)}
                    variant="ghost"
                    size="sm"
                  />
                </View>

                {doc.status === 'rejected' && doc.rejectionReason && (
                  <View className="bg-error/10 p-3 rounded-lg mb-3">
                    <Text variant="caption" className="text-error">
                      {doc.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Demo: Simulate Review Buttons */}
                {doc.status === 'pending' && (
                  <View className="flex-row gap-2">
                    <Button
                      title="Approve"
                      iconLeft={<Check size={16} color="white" />}
                      onPress={() => handleSimulateReview(doc.id, true)}
                      variant="success"
                      size="sm"
                      className="flex-1"
                    />
                    <DestructiveButton
                      title="Reject"
                      iconLeft={<X size={16} color="white" />}
                      onPress={() => handleSimulateReview(doc.id, false)}
                      size="sm"
                      className="flex-1"
                    />
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-5 max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="h3" weight="bold" className="text-foreground mb-2">
                Upload {DOCUMENT_TYPES.find((t) => t.value === selectedType)?.label}
              </Text>
              <Text variant="body" className="text-muted mb-5">
                Take clear photos of your document
              </Text>

              {/* Front Image */}
              <Text variant="caption" weight="semibold" className="text-muted mb-2">
                Front Side *
              </Text>
              <Button
                onPress={() => pickImage('front')}
                variant="secondary"
                size="lg"
                fullWidth
                className="mb-4"
              >
                {frontImage ? (
                  <Image source={{ uri: frontImage }} className="w-full h-32 rounded-lg" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Camera size={20} color={colors.muted} />
                    <Text variant="body" className="text-muted">Tap to upload front</Text>
                  </View>
                )}
              </Button>

              {/* Back Image */}
              <Text variant="caption" weight="semibold" className="text-muted mb-2">
                Back Side (Optional)
              </Text>
              <Button
                onPress={() => pickImage('back')}
                variant="secondary"
                size="lg"
                fullWidth
                className="mb-4"
              >
                {backImage ? (
                  <Image source={{ uri: backImage }} className="w-full h-32 rounded-lg" />
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Camera size={20} color={colors.muted} />
                    <Text variant="body" className="text-muted">Tap to upload back</Text>
                  </View>
                )}
              </Button>

              {/* Document Number */}
              <Text variant="caption" weight="semibold" className="text-muted mb-2">
                Document Number *
              </Text>
              <TextInput
                value={documentNumber}
                onChangeText={setDocumentNumber}
                placeholder="Enter document number"
                className="bg-surface text-foreground border border-border rounded-xl p-3 mb-4"
                placeholderTextColor={colors.muted}
              />

              {/* Expiry Date */}
              <Text variant="caption" weight="semibold" className="text-muted mb-2">
                Expiry Date (YYYY-MM-DD) *
              </Text>
              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="2025-12-31"
                className="bg-surface text-foreground border border-border rounded-xl p-3 mb-6"
                placeholderTextColor={colors.muted}
              />

              <View className="flex-row gap-3">
                <SecondaryButton
                  title="Cancel"
                  onPress={() => setUploadModalVisible(false)}
                  className="flex-1"
                />
                <PrimaryButton
                  title="Upload"
                  iconLeft={<Upload size={18} color="white" />}
                  onPress={handleUpload}
                  className="flex-1"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

