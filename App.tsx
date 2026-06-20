import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/screens/login';
import Home from './src/screens/home';
import TelaOcorrencia from './src/screens/TelaOcorrencia';
import TelaList from './src/screens/TelaList';
import TelaListTecnico from './src/screens/TelaListTecnico';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Ocorrencia" component={TelaOcorrencia} />
        <Stack.Screen name="TelaList" component={TelaList} />
        <Stack.Screen name="TelaListTecnico" component={TelaListTecnico} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}