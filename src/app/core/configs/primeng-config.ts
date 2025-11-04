import { definePreset } from "@primeuix/themes";
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from "primeng/config";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const BUTTON_COMPONENT = {
	button: {
		sm: {
			font: {
				size: "12px",
			},
		},
		colorScheme: {
			light: {
				outlined: {
					secondary: {
						color: "{gray.700}",
						borderColor: "{gray.300}",
					},
				},
				root: {
					secondary: {
						background: "#ffffff",
						border: {
							color: "{gray.200}",
						},
					},
					raised: {
						shadow: "0px 1px 2px 0px #0A0D120D",
					},
				},
			},
		},
		padding: {
			x: "14px",
			y: "10px",
		},
		border: {
			radius: "8px",
		},
	},
};

const POPOVER_COMPONENT = {
	popover: {
		content: {
			padding: 0,
		},
	},
};

const SELECT_COMPONENT = {
	select: {
		focus: {
			border: {
				color: "{gray.200}",
			},
			ring: {
				shadow: "none",
			},
		},
		hover: {
			border: {
				color: "{gray.200}",
			},
		},
		sm: {
			font: {
				size: "14px",
			},
		},
		padding: {
			y: "10px",
		},
		border: {
			radius: "8px",
			color: "{gray.200}",
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
		disabled: {
			background: "{gray.100}",
		},
	},
};
const MULTISELECT_COMPONENT = {
	multiselect: {
		focus: {
			border: {
				color: "{gray.200}",
			},
			ring: {
				shadow: "none",
			},
		},
		hover: {
			border: {
				color: "{gray.200}",
			},
		},
		sm: {
			font: {
				size: "14px",
			},
		},
		padding: {
			y: "10px",
		},
		border: {
			radius: "8px",
			color: "{gray.200}",
		},
		chip: {
			borderRadius: "6px",
			padding: {
				x: "9px",
				y: "2px",
			},
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
		disabled: {
			background: "{gray.100}",
		},
	},
};

const TEXTAREA_COMPONENT = {
	textarea: {
		focus: {
			border: {
				color: "{gray.200}",
			},
			ring: {
				shadow: "none",
			},
		},
		hover: {
			border: {
				color: "{gray.200}",
			},
		},
		sm: {
			font: {
				size: "14px",
			},
		},
		padding: {
			y: "10px",
		},
		border: {
			radius: "8px",
			color: "{gray.200}",
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
		disabled: {
			background: "{gray.100}",
		},
	},
};

const INPUTTEXT_COMPONENT = {
	inputtext: {
		focus: {
			border: {
				color: "{gray.200}",
			},
			ring: {
				shadow: "none",
			},
		},
		hover: {
			border: {
				color: "{gray.200}",
			},
		},
		sm: {
			font: {
				size: "14px",
			},
		},
		padding: {
			y: "10px",
		},
		border: {
			radius: "8px",
			color: "{gray.200}",
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
		disabled: {
			background: "{gray.100}",
		},
	},
};

const DATEPICKER_COMPONENT = {
	datepicker: {
		date: {
			width: "1.75rem",
			height: "1.75rem",
		},
		header: {
			padding: "0 0 0.5rem 0",
		},
		panel: {
			padding: "0.5rem",
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
	},
};

const AUTOCOMPLETE_COMPONENT = {
	autocomplete: {
		colorScheme: {
			light: {
				dropdown: {
					background: "{white}",
				},
			},
		},
		focus: {
			border: {
				color: "{gray.200}",
			},
			ring: {
				shadow: "none",
			},
		},
		hover: {
			border: {
				color: "{gray.200}",
			},
		},
		sm: {
			font: {
				size: "14px",
			},
		},
		padding: {
			y: "10px",
		},
		border: {
			radius: "8px",
			color: "{gray.200}",
		},
		shadow: "0px 1px 2px 0px #0A0D120D",
		disabled: {
			background: "{gray.100}",
		},
		option: {
			padding: "0.625rem 1rem",
			selectedBackground: "{gray.100}",
			selectedColor: "{gray.900}",
			selectedFocusBackground: "{gray.100}",
			selectedFocusColor: "{gray.950}",
		},
	},
};

const TABS_COMPONENT = {
	tabs: {
		colorScheme: {
			light: {
				tablist: {
					borderWidth: "0 0 1px 0",
					background: "transparent",
				},
				tab: {
					color: "{gray.500}",
					background: "transparent",
					borderWidth: "0 0 1px 0",
					borderColor: "transparent",
					hoverBorderColor: "{gray.200}",
					hoverBackground: "transparent",
					activeBackground: "transparent",
					padding: "12px",
				},
			},
		},
		tab: {
			activeBorderColor: "{primary.color}",
			activeBorderWidth: "0 0 1px 0",
			fontWeight: "600",
		},
		active: {
			bar: {
				// height: '1px',
				// bottom: '-1px',
				// background: '{primary.color}',
			},
		},
		tabpanel: {
			padding: "0", // Replace '16px' with the desired value
		},
	},
};
const PAGINATOR_COMPONENT = {
	paginator: {
		nav: {
			button: {
				selected: {
					background: "{gray.50}",
					color: "{secondary.700}",
				},
				color: "{gray.500}",
				border: {
					radius: "8px", // Example value, replace with the desired value
				},
			},
		},
	},
};
const TIMELINE_COMPONENT = {
	event: {
		marker: {
			size: "5px", // Replace 'default-size' with the desired value
		},
	},
};
const ACCORDION_COMPONENT = {
	accordion: {
		colorScheme: {
			light: {
				header: {
					background: "{white}",
					padding: " 14px 12px",
					borderRadius: "8px",
					last: {
						bottom: {
							borderRadius: "12px",
						},
						active: {
							bottom: {
								borderRadius: "0",
							},
						},
					},
					first: {
						top: {
							borderRadius: "12px",
						},
					},
					active: {
						background: "{white}",
					},
				},
				content: {
					padding: "12px",
				},
			},
		},
	},
};
const TOOLTIP_COMPONENT = {
	tooltip: {
		colorScheme: {
			light: {
				background: "{gray.900}",
			},
		},
	},
};
const TABLE_COMPONENT = {
	datatable: {
		row: {
			colorScheme: {
				light: {
					color: "{gray.600}",
				},
			},
		},
	},
};
const DIALOG_COMPONENT = {
	dialog: {
		footer: {
			padding: "0", // Replace '16px' with the desired value
		},
		content: {
			// padding: '0 24px', // Replace '16px' with the desired value
		},
	},
};
const CHIP_COMPONENT = {
	chip: {
		paddingX: "9px",
		paddingY: "2px",
		colorScheme: {
			light: {
				background: "{primary.50}",
				color: "{gray.700}",
				borderRadius: "6px",
				removeIconColor: "{gray.400}",
			},
		},
	},
};
const TOASTER_COMPONENT = {
	toast: {
		colorScheme: {
			light: {
				success: {
					borderColor: "{success.200}",
					background: "{success.50}",
				},
				warn: {
					borderColor: "{warn.200}",
					background: "{warn.50}",
				},
				error: {
					borderColor: "{danger.200}",
					background: "{danger.50}",
				},
			},
		},
		borderWidth: "1px",
		borderRadius: "12px",
		summary: {
			font: {
				size: "14px", // Example value, replace with the desired size
				weight: "600",
			},
		},
		detail: {
			font: {
				size: "14px", // Example value, replace with the desired size
				weight: "400",
			},
		},
	},
};
const MENU_COMPONENT = {
	menu: {
		borderRadius: "8px",
		borderColor: "{gray.200}",
		itemPadding: "9px 12px",
		item: {
			borderRadius: "6px",
		},
		listPadding: "4px",
	},
};
const CHECKBOX_COMPONENT = {
	checkbox: {
		width: "20px",
		height: "20px",
		iconSize: "12px",
		borderRadius: "6px",
	},
};
const PANEL_COMPONENT = {
	panel: {
		toggleable: {
			header: {
				padding: "0 !important",
			},
		},
		header: {
			background: "transparent !important",
			borderWidth: "0",
		},
		content: {
			padding: "0 !important",
		},
		borderWidth: "0",
		borderColor: "transparent",
	},
};

const RADIOBUTTON_COMPONENT = {
	radiobutton: {
		height: "20px",
		width: "20px",
	},
};
const FILE_UPLOAD_COMPONENT = {
	fileupload: {
		colorScheme: {
			light: {
				headerBackground: "transparent",
			},
		},
		headerBorderWidth: "0",
		contentGap: "4px",
		contentPadding: "0 1.125rem 1.125rem 1.25rem",
		progressbarHeight: "0",
	},
};

const MY_PRESET = definePreset(Lara, {
  components:{},
	semantic: {
		gray: {
			50: "#FAFAFA",
			100: "#F5F5F5",
			200: "#E9EAEB",
			300: "#D5D7DA",
			400: "#A4A7AE",
			500: "#717680",
			600: "#535862",
			700: "#414651",
			800: "#252B37",
			900: "#181D27",
			950: "#0A0D12",
		},
		red: {
			50: "#FFE2DE",
			100: "#FFCFC7",
			200: "#FFB0A3",
			300: "#FF8D7A",
			400: "#F76656",
			500: "#E9483C",
			600: "#CF3B27",
			700: "#B13121",
			800: "#951F19",
			900: "#730E0C",
			950: "#4B0505",
		},
		green: {
			50: "#EDFCF2",
			100: "#D3F8DF",
			200: "#AAF0C4",
			300: "#73E2A3",
			400: "#3CCB7F",
			500: "#16B364",
			600: "#099250",
			700: "#087443",
			800: "#095C37",
			900: "#084C2E",
			950: "#052E1C",
		},
		blue: {
			50: "#EFF8FF",
			100: "#D1E9FF",
			200: "#B2DDFF",
			300: "#84CAFF",
			400: "#53B1FD",
			500: "#2E90FA",
			600: "#1570EF",
			700: "#175CD3",
			800: "#1849A9",
			900: "#194185",
			950: "#102A56",
		},
		pink: {
			50: "#FDF2FA",
			100: "#FCE7F6",
			200: "#FCCEEE",
			300: "#FAA7E0",
			400: "#F670C7",
			500: "#EE46BC",
			600: "#DD2590",
			700: "#C11574",
			800: "#9E165F",
			900: "#851651",
			950: "#4E0D30",
		},
		purple: {
			50: "#F4F3FF",
			100: "#EBE9FE",
			200: "#D9D6FE",
			300: "#BDB4FE",
			400: "#9B8AFB",
			500: "#7A5AF8",
			600: "#6938EF",
			700: "#5925DC",
			800: "#4A1FB8",
			900: "#3E1C96",
			950: "#27115F",
		},
		yellow: {
			50: "#FEFBE8",
			100: "#FEF7C3",
			200: "#FEEE95",
			300: "#FDE272",
			400: "#FAC515",
			500: "#EAAA08",
			600: "#CA8504",
			700: "#A15C07",
			800: "#854A0E",
			900: "#713B12",
			950: "#542C0D",
		},
		amber: {
			50: "#FFFAEB",
			100: "#FEF0C7",
			200: "#FEDF89",
			300: "#FEC84B",
			400: "#FDB022",
			500: "#F79009",
			600: "#DC6803",
			700: "#B54708",
			800: "#93370D",
			900: "#7A2E0E",
			950: "#4E1D09",
		},
		warn: {
			50: "{amber.50}",
			100: "{amber.100}",
			200: "{amber.200}",
			300: "{amber.300}",
			400: "{amber.400}",
			500: "{amber.500}",
			600: "{amber.600}",
			700: "{amber.700}",
			800: "{amber.800}",
			900: "{amber.900}",
			950: "{amber.950}",
		},
		danger: {
			50: "#FFE2DE",
			100: "#FFCFC7",
			200: "#FFB0A3",
			300: "#FF8D7A",
			400: "#F76656",
			500: "#E9483C",
			600: "#CF3B27",
			700: "#B13121",
			800: "#951F19",
			900: "#730E0C",
			950: "#4B0505",
		},
		success: {
			50: "#ECFDF3",
			100: "#DCFAE6",
			200: "#ABEFC6",
			300: "#75E0A7",
			400: "#47CD89",
			500: "#17B26A",
			600: "#079455",
			700: "#067647",
			800: "#085D3A",
			900: "#074D31",
			950: "#053321",
		},
		primary: {
			50: "{red.50}",
			100: "{red.100}",
			200: "{red.200}",
			300: "{red.300}",
			400: "{red.400}",
			500: "{red.500}",
			600: "{red.600}",
			700: "{red.700}",
			800: "{red.800}",
			900: "{red.900}",
			950: "{red.950}",
		},
		colorScheme: {
			light: {
				surface: {
					0: "#ffffff",
					50: "{zinc.50}",
					100: "{zinc.100}",
					200: "{zinc.200}",
					300: "{zinc.300}",
					400: "{zinc.400}",
					500: "{zinc.500}",
					600: "{zinc.600}",
					700: "{zinc.700}",
					800: "{zinc.800}",
					900: "{zinc.900}",
					950: "{zinc.950}",
				},
				primary: {
					color: "{red.600}",
					inverseColor: "{red.100}",
					hoverColor: "{red.500}",
					activeColor: "{red.700}",
				},
				warn: {
					color: "{amber.600}",
					inverseColor: "{amber.100}",
					hoverColor: "{amber.500}",
					activeColor: "{amber.700}",
				},
			},
			dark: {
				surface: {
					0: "#ffffff",
					50: "{slate.50}",
					100: "{slate.100}",
					200: "{slate.200}",
					300: "{slate.300}",
					400: "{slate.400}",
					500: "{slate.500}",
					600: "{slate.600}",
					700: "{slate.700}",
					800: "{slate.800}",
					900: "{slate.900}",
					950: "{slate.950}",
				},
			},
		},
	},
});

export const PRIMENG_CONFIG = [
  provideAnimationsAsync(),
	providePrimeNG({
		ripple: true,
		theme: {
			preset: MY_PRESET,
			options: {
				prefix: "p",
				darkModeSelector: ".my-dark-mode",
				cssLayer: false,
			},
		},
	}),
];
