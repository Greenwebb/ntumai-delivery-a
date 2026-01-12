// @ts-nocheck

import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import {
  Button,
  Input,
  Card,
  Badge,
  Alert,
  Avatar,
  Switch,
  Progress,
  Spinner,
  Skeleton,
  Divider,
  Checkbox,
  RadioButton,
} from './index';

export default function Example() {
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">UI Components Example</Text>
      

      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Buttons</Text>
        <View className="space-y-2">
          <Button title="Primary Button" onPress={() => {}} />
          <Button title="Secondary" variant="secondary" onPress={() => {}} />
          <Button title="Outline" variant="outline" onPress={() => {}} />
          <Button title="Loading" loading onPress={() => {}} />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Input</Text>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={inputValue}
          onChangeText={setInputValue}
          keyboardType="email-address"
        />
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Badges</Text>
        <View className="flex-row space-x-2">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Alerts</Text>
        <View className="space-y-3">
          <Alert title="Info" description="This is an info alert" variant="info" />
          <Alert description="This is a success message" variant="success" />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Avatars</Text>
        <View className="flex-row space-x-3">
          <Avatar fallback="JD" size="sm" />
          <Avatar fallback="AB" size="md" />
          <Avatar fallback="XY" size="lg" />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Switch</Text>
        <Switch
          value={switchValue}
          onValueChange={setSwitchValue}
          label="Enable notifications"
        />
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Progress</Text>
        <View className="space-y-3">
          <Progress value={25} />
          <Progress value={60} variant="success" />
          <Progress value={80} variant="warning" />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Spinner</Text>
        <View className="flex-row space-x-4">
          <Spinner size="small" />
          <Spinner size="large" variant="primary" />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Skeleton</Text>
        <View className="space-y-2">
          <Skeleton height={16} />
          <Skeleton height={16} width="80%" />
          <Skeleton height={40} variant="rectangular" />
        </View>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Divider</Text>
        <Divider />
        <Text className="text-center py-2">Content above and below</Text>
        <Divider>OR</Divider>
        <Text className="text-center py-2">Divider with text</Text>
      </Card>


      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Checkbox</Text>
        <Checkbox
          checked={checkboxValue}
          onCheckedChange={setCheckboxValue}
          label="I agree to the terms"
        />
      </Card>

      
      <Card className="mb-4">
        <Text className="text-lg font-semibold mb-3">Radio Button</Text>
        <View className="space-y-2">
          <RadioButton
            selected={radioValue === 'option1'}
            onSelect={() => setRadioValue('option1')}
            label="Option 1"
          />
          <RadioButton
            selected={radioValue === 'option2'}
            onSelect={() => setRadioValue('option2')}
            label="Option 2"
          />
        </View>
      </Card>
    </ScrollView>
  );
}
