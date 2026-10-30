import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from "expo-status-bar";
import { AppContent } from "./src/app/AppContent";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <AppContent />
        </GestureHandlerRootView>
    );
}