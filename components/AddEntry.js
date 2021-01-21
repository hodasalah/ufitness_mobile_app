import React, { Component } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Button,
} from "react-native";
import {
    getMetricMetaInfo,
    timeToString,
    getDailyReminderValue,
    clearLocalNotification,
    setLocalNotification,
} from "../utils/helpers";
import UdacitySlider from "./UdacitySlider";
import UdacityStepper from "./Udacitystepper";
import DateHeader from "./DateHeader";
import { Ionicons } from "@expo/vector-icons";
import TextButton from "./TextButton";
import { submitEntry, removeEntry } from "../utils/api";
import { connect } from "react-redux";
import { addEntry } from "../actions";
import { purple, white } from "../utils/colors";
import { CommonActions } from "@react-navigation/native";

function SubmitBtn({ onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={
                Platform.OS === "ios"
                    ? styles.iosSubmitBtn
                    : styles.AndroidSubmitBtn
            }
        >
            <Text style={styles.submitBtnText}>SUBMIT</Text>
        </TouchableOpacity>
    );
}

class AddEntry extends Component {
    state = {
        run: 0,
        bike: 0,
        swim: 0,
        sleep: 0,
        eat: 0,
    };

    increment = (metric) => {
        const { max, step } = getMetricMetaInfo(metric);
        this.setState((state) => {
            const count = state[metric] + step;

            return {
                ...state,
                [metric]: count > max ? max : count,
            };
        });
    };
    decrement = (metric) => {
        this.setState((state) => {
            const count = state[metric] - getMetricMetaInfo(metric).step;

            return {
                ...state,
                [metric]: count < 0 ? 0 : count,
            };
        });
    };
    slide = (metric, value) => {
        this.setState(() => ({
            [metric]: value,
        }));
    };
    submitInfo = () => {
        const info = this.state;
        const key = timeToString();
        //update redux
        this.props.dispatch(
            addEntry({
                [key]: info,
            })
        );
        this.setState({
            run: 0,
            bike: 0,
            swim: 0,
            sleep: 0,
            eat: 0,
        });
        //save to 'DB'
        submitEntry({ key, info });
        // navigate to home
        this.props.navigation.dispatch(
            CommonActions.goBack({
                key: "AddEntry",
            })
        );
        // clean local notification
        clearLocalNotification()
      .then(setLocalNotification)
    };
    reset = () => {
        const key = timeToString();

        // Update Redux
        this.props.dispatch(
            addEntry({
                [key]: getDailyReminderValue(),
            })
        );
        // Route to Home
        this.props.navigation.dispatch(
            CommonActions.goBack({
                key: "AddEntry",
            })
        );
        // Update "DB"
        removeEntry(key);
    };
    render() {
        console.log(this.props);
        const info = getMetricMetaInfo();
        if (this.props.alreadyLogged) {
            return (
                <View style={styles.center}>
                    <Ionicons
                        name={Platform.OS === "ios" ? "ios-happy" : "md-happy"}
                        size={100}
                    />
                    <Text>
                        :) You already logged your information for today.
                    </Text>
                    <TextButton style={{ padding: 10 }} onPress={this.reset}>
                        Reset
                    </TextButton>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <DateHeader date={new Date().toLocaleDateString()} />
                {Object.keys(info).map((key) => {
                    const value = this.state[key];
                    const { type, getIcon, ...rest } = info[key];
                    return (
                        <View key={key} style={styles.row}>
                            {getIcon()}
                            {type === "slider" ? (
                                <UdacitySlider
                                    value={value}
                                    onChange={(value) => this.slide(key, value)}
                                    {...rest}
                                />
                            ) : (
                                <UdacityStepper
                                    value={value}
                                    onIncrement={() => this.increment(key)}
                                    onDecrement={() => this.decrement(key)}
                                    {...rest}
                                />
                            )}
                        </View>
                    );
                })}
                <SubmitBtn onPress={this.submitInfo} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: white,
        flex: 1,
        padding: 20,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
    },
    iosSubmitBtn: {
        backgroundColor: purple,
        padding: 10,
        borderRadius: 7,
        height: 45,
        marginLeft: 40,
        marginRight: 40,
    },
    AndroidSubmitBtn: {
        backgroundColor: purple,
        padding: 10,
        paddingRight: 30,
        paddingLeft: 30,
        height: 45,
        borderRadius: 2,
        alignSelf: "flex-end",
        justifyContent: "center",
        alignItems: "center",
    },
    submitBtnText: {
        color: white,
        fontSize: 22,
        textAlign: "center",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 30,
        marginRight: 30,
    },
});
const mapStateToProps = (state) => {
    const key = timeToString();
    return {
        alreadyLogged: state[key] && typeof state[key].today === "undefined",
    };
};
export default connect(mapStateToProps)(AddEntry);
