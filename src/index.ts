// @ts-expect-error no types for node-blink1
//  https://github.com/sandeepmistry/node-blink1/pull/39
import Blink1 from 'node-blink1';
import { Compiler, Stats } from 'webpack';

export class WebpackBlink1Plugin {
    // https://github.com/sandeepmistry/node-blink1
    private blink1: Blink1;
    private readonly ignoreWarnings: boolean;
    pluginName = 'WebpackBlink1Plugin';

    colors = {
        red: [255, 0, 0],
        green: [0, 255, 0],
        yellow: [255, 255, 0],
        purple: [64, 0, 255],
        black: [0, 0, 0]
    }

    constructor({
        ignoreWarnings = false,
        breathingPeriod = 4000
    }) {
        this.ignoreWarnings = ignoreWarnings;
        this.initBlink1();
        this.initNodeOptions();
        this.configureBreathingPattern(breathingPeriod);
    }

    initNodeOptions() {
        // Explicitly call exit for ctrl+c/webstorm run/etc so that we can clean up Blink1
        process.on('SIGINT', () => process.exit());
        process.on('exit', () => this.destroy());
    }

    initBlink1() {
        try {
            this.blink1 = new Blink1();
        } catch (ex) {
            console.log(ex);
            process.exit();
        }

        this.blink1.enableDegamma = false;
    }

    // Webpack.apply
    apply(compiler: Compiler): void {
        if (!compiler.hooks) {
            throw new Error('This plugin requires Webpack 5+');
        }

        // https://webpack.js.org/api/compiler-hooks/
        compiler.hooks.compile.tap(this.pluginName, () => this.compile());
        compiler.hooks.done.tap(this.pluginName, (stats) => this.done(stats));
        // todo if watch, then kill the led when the plugin exits
        // otherwise we are in build mode, turn the led green for some seconds and then off
        //  leave red on?
        // compiler.watchMode
        if (compiler.watchMode) {

        }
    }

    compile(): void {
        this.blink1.off();
        this.blink1.playLoop(0, 1, 0);
    }

    done(stats: Stats): void {
        if (this.hasErrors(stats)) {
            this.blink1.setRGB(...this.colors.red);
        } else if(!this.ignoreWarnings && this.hasWarnings(stats)) {
            this.blink1.setRGB(...this.colors.yellow);
        } else {
            this.blink1.setRGB(...this.colors.green);
        }
    }

    hasErrors(stats: Stats): boolean {
        return stats.hasErrors()
            || stats.compilation.children.some(child => child.getStats().hasErrors());
    }

    hasWarnings(stats: Stats): boolean {
        return stats.hasWarnings()
            || stats.compilation.children.some(child => child.getStats().hasWarnings());
    }

    configureBreathingPattern(period: number): void {
        const halfBreath = period / 2;
        // set both leds
        this.blink1.setLedN(0);
        // breathe in
        this.blink1.writePatternLine(halfBreath, ...this.colors.purple, 0);
        // breathe out
        this.blink1.writePatternLine(halfBreath, ...this.colors.black, 1);
    }

    destroy(): void {
        this.blink1.off();
        this.blink1.close();
    }
}

module.exports = WebpackBlink1Plugin;
