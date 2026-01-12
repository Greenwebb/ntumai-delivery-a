// @ts-nocheck
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { PrimaryButton, SecondaryButton, IconButton, OutlineButton } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/modal';
import { StatusBadge, LoadingState, EmptyStateView } from '@/components/ui/shared-components';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';

import { View, ScrollView, Share, Clipboard, Pressable, TextInput } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { referralMockService } from '@/src/api/mockServices.extended';
import { useToast } from '@/lib/toast-provider';

export default function ReferralScreen() { const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [applyingCode, setApplyingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => { loadReferralData(); }, []);
  const loadReferralData = async () => { try { const response = await referralMockService.getReferralCode('user_1');

      if (response.success) { setReferralData(response.data); } } catch (error) { toast.error('Failed to load referral data'); } finally { setLoading(false); } };
  const handleCopyCode = async () => { try { await Clipboard.setString(referralData.referralCode);

      setCopiedCode(true);

      setTimeout(() => setCopiedCode(false), 2000); } catch (error) { toast.error('Failed to copy code'); } };
  const handleShareCode = async () => { try { await Share.share({ message: `Join Ntumai using my referral code: ${referralData.referralCode}. Get â­5 credit when you sign up!`,

        title: 'Ntumai Referral'}); } catch (error) { toast.error('Failed to share code'); } };
  const handleApplyCode = async () =>  {
    if (!referralCode.trim()) { toast.error('Please enter a referral code');

      return; }

    setApplyingCode(true);

    try { const response = await referralMockService.applyReferralCode(

        referralCode.trim()

      );

      if (response.success) { toast.success(response.data.message);

        setReferralCode(''); } } catch (error) { toast.error('Invalid referral code'); } finally { setApplyingCode(false); } };

  if (loading) { return (

      <View className="flex-1 justify-center items-center bg-background">

        <LoadingState />

      </View>

    ); }

  return (

    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>

      {/* Header */}

      <View className="bg-background border-b border-border px-4 py-4">

        <Text className="text-2xl font-bold text-foreground">Referrals & Rewards</Text>

        <Text className="text-sm text-muted mt-1">

          Earn credits by referring friends

        </Text>

      </View>

      <View className="px-4 py-4">

        {/* Your Referral Code */}

        <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 mb-6 text-white">

          <Text className="text-white text-sm opacity-90 mb-2">Your Referral Code</Text>

          <Text className="text-white text-3xl font-bold mb-4 tracking-wider">

            {referralData?.referralCode}

          </Text>

          <View className="flex-row gap-2">

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleCopyCode}

              className="flex-1 bg-background bg-opacity-20 py-2 rounded-lg flex-row items-center justify-center"

            >

              <Ionicons name="copy" size={18} color="white" />

              <Text className="text-white font-semibold ml-2">

                {copiedCode ? 'Copied!' : 'Copy'}

              </Text>

            </Pressable>

            <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleShareCode}

              className="flex-1 bg-background bg-opacity-20 py-2 rounded-lg flex-row items-center justify-center"

            >

              <Ionicons name="share-social" size={18} color="white" />

              <Text className="text-white font-semibold ml-2">Share</Text>

            </Pressable>

          </View>

        </View>

        {/* Earnings Summary */}

        <View className="grid grid-cols-2 gap-4 mb-6">

          <View className="bg-background rounded-lg p-4 border border-border">

            <Text className="text-muted text-sm mb-1">Total Referrals</Text>

            <Text className="text-3xl font-bold text-foreground">

              {referralData?.totalReferrals}

            </Text>

          </View>

          <View className="bg-background rounded-lg p-4 border border-border">

            <Text className="text-muted text-sm mb-1">Total Earnings</Text>

            <Text className="text-3xl font-bold text-primary">

              â­{referralData?.totalEarnings.toFixed(2)}

            </Text>

          </View>

        </View>

        {/* Pending Earnings */}

        {referralData?.pendingEarnings > 0 && (

          <View className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">

            <View className="flex-row items-center justify-between">

              <View>

                <Text className="text-yellow-900 text-sm">Pending Earnings</Text>

                <Text className="text-2xl font-bold text-yellow-900 mt-1">

                  â­{referralData?.pendingEarnings.toFixed(2)}

                </Text>

              </View>

              <Ionicons name="hourglass" size={32} color="#D97706" />

            </View>

            <Text className="text-xs text-yellow-700 mt-2">

              These will be credited after your referrals complete their first order

            </Text>

          </View>

        )}

        {/* How It Works */}

        <View className="bg-background rounded-lg p-4 mb-6 border border-border">

          <Text className="text-lg font-bold text-foreground mb-4">How It Works</Text>

          <View className="space-y-3">

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-sm font-bold">1</Text>

              </View>

              <Text className="text-gray-700 flex-1">Share your referral code with friends</Text>

            </View>

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-sm font-bold">2</Text>

              </View>

              <Text className="text-gray-700 flex-1">

                They sign up using your code

              </Text>

            </View>

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-sm font-bold">3</Text>

              </View>

              <Text className="text-gray-700 flex-1">

                They complete their first order

              </Text>

            </View>

            <View className="flex-row items-start">

              <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-3 mt-0.5">

                <Text className="text-white text-sm font-bold">4</Text>

              </View>

              <Text className="text-gray-700 flex-1">

                You both get â­5 credit!

              </Text>

            </View>

          </View>

        </View>

        {/* Apply Referral Code */}

        <View className="bg-background rounded-lg p-4 border border-border mb-6">

          <Text className="text-lg font-bold text-foreground mb-3">Have a Referral Code?</Text>

          <TextInput

            value={referralCode}

            onChangeText={setReferralCode}

            placeholder="Enter referral code"

            className="bg-surface rounded-lg px-4 py-3 text-foreground mb-3 border border-border"

            placeholderTextColor="#999"

          />

          <Pressable
style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
onPress={handleApplyCode}

            disabled={applyingCode}

            className={`py-3 rounded-lg ${ applyingCode ? 'bg-gray-300' : 'bg-blue-500' }`}

          >

            <Text className="text-center text-white font-bold">

              {applyingCode ? 'Applying...' : 'Apply Code'}

            </Text>

          </Pressable>

        </View>

        {/* Terms */}

        <View className="bg-surface rounded-lg p-4 mb-6">

          <Text className="text-xs text-muted leading-5">

            <Text className="font-bold">Terms: </Text>

            Referral credits are valid for 30 days. One referral code per user. Credits cannot be transferred or refunded.

          </Text>

        </View>

      </View>

    </ScrollView>

  ); }

export { RouteErrorBoundary as ErrorBoundary } from "@/components/route-error-boundary";

