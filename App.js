import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Case from './components/Case'

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome to the PLL Trainer</Text>
        <Case />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
