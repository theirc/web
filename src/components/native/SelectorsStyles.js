'use strict';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  Selectors: {
    flexDirection: 'column',
    flex: 1,
    display: 'flex',
    minHeight: '100%',
  },
  spacer: {
		flexGrow: 1,
		maxHeight: 400,
	},
  bottom: {
		height: 100,
	},
  item: {
		margin: 10,
		padding: 5,
		backgroundColor: '#f0f0f0',
		height: 52,
		fontSize: 16,
		color: '#5e5e5e',
		letterSpacing: 0,
		lineHeight: 42,
    textAlign: 'center',
  },
  text: {
		height: 30,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
	i: {
		display: 'flex',
		fontSize: 45,
    textAlign: 'center',
    marginBottom: 20,
  },

		h1: {
			fontSize: 18,
			color: '#000000',
			letterSpacing: 0,
			lineHeight: 20,
			fontWeight: 'bold',
			marginBottom: 0,
		},

		h2: {
			fontSize: 14,
			color: '#000000',
			letterSpacing: 0,
			lineHeight: 20,
			marginBottom: 0,
			padding: 5,
		}
});
