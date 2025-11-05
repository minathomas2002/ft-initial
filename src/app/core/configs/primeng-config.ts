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
      25:"#FCFCFC",
			50: "#F9FAFA",
			100: "#ECEDF0",
			200: "#D5D6DD",
			300: "#BBBEC8",
			400: "#9197A6",
			500: "#777E91",
			600: "#606675",
			700: "#4A4E5A",
			800: "#33363E",
			900: "#1D1E23",
			950: "#060607",
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
      25:"F8FCFE",
			50: "#F2F9FD",
			100: "#E5F3FB",
			200: "#B8DCF5",
			300: "#8AC6EE",
			400: "#5CB0E8",
			500: "#2E99E1",
			600: "#0083DB",
			700: "#006EB8",
			800: "#005995",
			900: "#004472",
			950: "#002F4F",
		},
    orange: {
      25: "#FFF9F4",
      50: "#FEF4EB",
      100: "#FDE0C8",
      200: "#FBCBA4",
      300: "#FAB781",
      400: "#F8A35D",
      500: "#F78F3A",
      600: "#D47B32",
      700: "#B2672A",
      800: "#8F5322",
      900: "#5E3616",
      950: "#4A2B11",
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
      25:"#FFF9F2",
			50: "#FFFAE7",
			100: "#FFF0BB",
			200: "#FFE68F",
			300: "#FFD338",
			400: "#FFD338",
			500: "#FFC90C",
			600: "#D6A90A",
			700: "#AD8908",
			800: "#856906",
			900: "#5C4804",
			950: "#332802",
		},
		danger: {
      25:"#FBF4F3",
			50: "#F7E9E8",
			100: "#EAC1BE",
			200: "#DD9A95",
			300: "#CF726B",
			400: "#C24B42",
			500: "#B42318",
			600: "#A22016",
			700: "#901C13",
			800: "#7E1911",
			900: "#6C150E",
			950: "#5A120C",
		},
		success: {
      25:"#F6FEF9",
			50: "#F2F8F6",
			100: "#B9D9CB",
			200: "#8CC0AA",
			300: "#60A789",
			400: "#338F68",
			500: "#067647",
			600: "#05683E",
			700: "#055A36",
			800: "#044C2D",
			900: "#033D25",
			950: "#022F1C",
		},
		primary: {
      25:"#FAFBFD",
			50: "#F4F7FA",
			100: "#E8ECF4",
			200: "#C0CBE0",
			300: "#97AACC",
			400: "#6F89B9",
			500: "#4767A5",
			600: "#1E4691",
			700: "#1B3F82",
			800: "#183874",
			900: "#153166",
			950: "#122A57",
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
