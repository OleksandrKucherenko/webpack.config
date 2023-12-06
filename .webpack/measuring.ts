import webpack from "webpack";
import SpeedMeasurePlugin from "speed-measure-webpack-plugin";
import { IndexedPlugin } from "./types";

// listening to those env variables
const envMeasure = process.env.MEASURE;

export const omitPlugins = (configuration: webpack.Configuration, ...names: string[]): IndexedPlugin[] => {
  const { plugins } = configuration;
  if (!plugins) throw new Error("Plugins are not defined.");

  const extracted = plugins
    .map((plugin, index) => (names.includes(plugin?.constructor.name ?? "<skip>") ? { index, plugin } : null))
    .filter(Boolean) as IndexedPlugin[];

  return extracted ?? [];
};

export const recoverPlugins = (configuration: webpack.Configuration, ...plugins: IndexedPlugin[]) => {
  const { plugins: originalPlugins } = configuration;
  if (!originalPlugins) throw new Error("Plugins are not defined.");

  plugins.forEach(({ index, plugin }) => {
    originalPlugins[index] = plugin;
  });
};

export const withSmpMeasuring = (configuration: webpack.Configuration) => {
  // skip any manipulation if measurement is disabled, reduce the overhead
  if (!envMeasure) return configuration;

  // FIXME (olku): this is a hack/workaround to get the SMP plugin work.
  // ref: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167
  const excludes = omitPlugins(configuration, "MiniCssExtractPlugin");

  const smp = new SpeedMeasurePlugin({ disable: !envMeasure });
  const withSmpMeasuring = smp.wrap(configuration);

  recoverPlugins(withSmpMeasuring, ...excludes);

  return withSmpMeasuring;
};
