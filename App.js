import React, { useEffect } from "react";
import AddEntry from "./components/AddEntry";
import { View, Button, Platform, StatusBar } from "react-native";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "./reducers";
import History from "./components/History";
import { purple, white } from "./utils/colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Constants from "expo-constants";
import EntryDetail from "./components/EntryDetail";
import { Dimensions } from "react-native";
import Live from "./components/Live";
import { setLocalNotification } from "./utils/helpers";

const { width } = Dimensions.get("window");
function UdaciStatusBar({ backgroundColor, ...props }) {
    return (
        <View style={{ backgroundColor, height: Constants.statusBarHeight }}>
            <StatusBar
                translucent
                backgroundColor={backgroundColor}
                {...props}
            />
        </View>
    );
}

export default function App() {
    useEffect(() => {
        setLocalNotification();
    }, []);
    const store = createStore(reducer);
    const tabs = {
        History: {
            component: History,
            name: "History",
            screenOptions: {
                tabBarIcon: ({ tintColor }) => (
                    <Ionicons
                        name="ios-bookmarks"
                        size={30}
                        color={tintColor}
                    />
                ),
            },
        },
        AddEntry: {
            component: AddEntry,
            name: "AddEntry",
            screenOptions: {
                tabBarIcon: ({ tintColor }) => (
                    <FontAwesome
                        name="plus-square"
                        size={30}
                        color={tintColor}
                    />
                ),
            },
        },
        Live: {
            component: Live,
            name: "Live",
            screenOptions: {
                tabBarIcon: ({ tintColor }) => (
                    <Ionicons
                        name="ios-speedometer"
                        size={30}
                        color={tintColor}
                    />
                ),
            },
        },
    };
    const Tab =
        Platform.OS === "ios"
            ? createBottomTabNavigator()
            : createMaterialTopTabNavigator();

    const TabNavigatorConfig = {
        navigationOptions: {
            header: null,
        },
        tabBarOptions: {
            activeTintColor: Platform.OS === "ios" ? purple : white,
            style: {
                height: 56,
                backgroundColor: Platform.OS === "ios" ? white : purple,
                shadowColor: "rgba(0, 0, 0, 0.24)",
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
                shadowRadius: 6,
                shadowOpacity: 1,
            },
        },
    };
    const Stack = createStackNavigator();
    const HistoryStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Screen {...tabs.History} />
                <Stack.Screen
                    name="EntryDetail"
                    component={EntryDetail}
                    options={{
                        headerTintColor: white,
                        headerStyle: {
                            backgroundColor: purple,
                        },
                        headerTitleStyle: {
                            width: width,
                        },
                    }}
                />
            </Stack.Navigator>
        );
    };
    return (
        <Provider store={store}>
            <UdaciStatusBar backgroundColor={purple} barStyle="light-content" />
            <NavigationContainer style={{ flex: 1 }}>
                <Tab.Navigator
                    initialRouteName="AddEntry"
                    {...TabNavigatorConfig}
                >
                    <Tab.Screen name="History" component={HistoryStack} />
                    <Tab.Screen {...tabs.AddEntry} />
                    <Tab.Screen {...tabs.Live} />
                </Tab.Navigator>
            </NavigationContainer>
        </Provider>
    );
}
