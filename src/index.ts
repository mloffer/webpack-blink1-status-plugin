// @ts-expect-error no types for node-blink1
//  https://github.com/sandeepmistry/node-blink1/pull/39
import { Blink1 } from 'node-blink1';
import { Compiler, Stats } from 'webpack';

type RGBValue = [number, number, number];

type Options = {
    showWarnings: boolean;
    // time in milliseconds it takes to breathe the led in and out, one cycle
    breathingPeriod: number;
}

export class WebpackBlink1StatusPlugin {
    // https://github.com/sandeepmistry/node-blink1
    private blink1: Blink1;
    private readonly showWarnings: boolean;
    pluginName = 'WebpackBlink1StatusPlugin';

    colors: Record<string, RGBValue> = {
        red: [255, 0, 0],
        green: [0, 255, 0],
        yellow: [255, 255, 0],
        purple: [64, 0, 255],
        black: [0, 0, 0]
    }

    constructor(options: Partial<Options> = {}) {
        const optionsWithDefaults = Object.assign<Options, Partial<Options>>({
            showWarnings: false,
            breathingPeriod: 4000
        }, options);
        this.showWarnings = optionsWithDefaults.showWarnings;
        this.initBlink1();
        this.initNodeOptions();
        this.configureBreathingPattern(optionsWithDefaults.breathingPeriod);
    }

    initNodeOptions(): void {
        // Explicitly call exit for ctrl+c/webstorm run/etc so that we can clean up Blink1
        process.on('SIGINT', () => process.exit());
        process.on('exit', () => this.destroy());
    }

    initBlink1(): void {
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
    }

    compile(): void {
        this.blink1.off();
        // play pattern written to memory in configureBreathingPattern
        this.blink1.playLoop(0, 1, 0);
    }

    // compiler work is done (build or watch)
    done(stats: Stats): void {
        // errors take precedence
        if (this.hasErrors(stats)) {
            this.blink1.setRGB(...this.colors.red);
        // otherwise show warnings, if configured
        } else if(this.showWarnings && this.hasWarnings(stats)) {
            this.blink1.setRGB(...this.colors.yellow);
        // else we have a successful build
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
