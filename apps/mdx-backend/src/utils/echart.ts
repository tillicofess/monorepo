import { BarChart, LineChart, PictorialBarChart } from "echarts/charts";
import {
	DataZoomComponent,
	GridComponent,
	LegendComponent,
	MarkLineComponent,
	TitleComponent,
	TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
	LineChart,
	BarChart,
	PictorialBarChart,
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	DataZoomComponent,
	MarkLineComponent,
	CanvasRenderer,
]);

export default echarts;
export type { ECharts } from "echarts";
