# Angular usage
See https://www.npmjs.com/package/@angular-builders/custom-webpack
npm i --save-dev @angular-builders/custom-webpack

```javascript
const blink1status = require('webpack-blink1-status-plugin');

module.exports = {
	plugins: [
		new blink1status(true)
	]
};
```

```typescript

```

# TODOs
Write tests https://blog.iansinnott.com/testing-webpack-plugins/
