import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Case from './components/Case'
import getPllFromColors from './utils'
{/* <Text>{JSON.stringify(getPllFromColors('F', 'B', 'F', 'R', 'F', 'R'))}</Text> */}
        

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text>Welcome to the PLL Trainer</Text>
        <Text>Testing</Text>
        <Text>{JSON.stringify(getPllFromColors('F', 'B', 'F', 'R', 'F', 'R'))}</Text>
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
