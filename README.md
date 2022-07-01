Use a [Blink1](https://blink1.thingm.com/) device to visually communicate webpack build status.
* During compilation (build or when the watcher picks up a change), the Blink1 will breathe purple.
* Once compliation is done, the Blink1 will turn red (error) or green (success).
* You may optionally configure that warnings be shown (see constructor)

# Angular usage
Install [@angular-builders/custom-webpack](https://www.npmjs.com/package/@angular-builders/custom-webpack) and modify your angular.json to specify your preferred extra-webpack.config format (js or ts).

# Webpack config
## Javascript
```javascript
const WebpackBlink1StatusPlugin = require('webpack-blink1-status-plugin');

module.exports = {
	plugins: [
		new WebpackBlink1StatusPlugin()
	]
};
```

## Typescript
```typescript
import * as webpack from 'webpack';
import { WebpackBlink1StatusPlugin } from 'webpack-blink1-status-plugin';

const config: webpack.Configuration = {
	plugins: [
		// @ts-ignore type mismatch? https://github.com/webpack-contrib/copy-webpack-plugin/issues/599
		new WebpackBlink1StatusPlugin()
	]
};

export default config;
```

# TODOs
Write tests https://blog.iansinnott.com/testing-webpack-plugins/
