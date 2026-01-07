import { ICountry } from '../interfaces';

// Helper function to get flag URL from country code
const getFlagUrl = (code: string): string => {
	// Convert country code to lowercase for flagcdn.com
	const lowerCode = code.toLowerCase();
	return `https://flagcdn.com/w20/${lowerCode}.png`;
};

// Countries array sorted alphabetically by name with Arabic names included
export const COUNTRIES: ICountry[] = [
	{ code: 'AF', name: 'Afghanistan', nameAr: 'أفغانستان', dialCode: '+93', flagUrl: getFlagUrl('AF') },
	{ code: 'AL', name: 'Albania', nameAr: 'ألبانيا', dialCode: '+355', flagUrl: getFlagUrl('AL') },
	{ code: 'DZ', name: 'Algeria', nameAr: 'الجزائر', dialCode: '+213', flagUrl: getFlagUrl('DZ') },
	{ code: 'AG', name: 'Antigua and Barbuda', nameAr: 'أنتيغوا وباربودا', dialCode: '+1', flagUrl: getFlagUrl('AG') },
	{ code: 'AR', name: 'Argentina', nameAr: 'الأرجنتين', dialCode: '+54', flagUrl: getFlagUrl('AR') },
	{ code: 'AM', name: 'Armenia', nameAr: 'أرمينيا', dialCode: '+374', flagUrl: getFlagUrl('AM') },
	{ code: 'AU', name: 'Australia', nameAr: 'أستراليا', dialCode: '+61', flagUrl: getFlagUrl('AU') },
	{ code: 'AT', name: 'Austria', nameAr: 'النمسا', dialCode: '+43', flagUrl: getFlagUrl('AT') },
	{ code: 'AZ', name: 'Azerbaijan', nameAr: 'أذربيجان', dialCode: '+994', flagUrl: getFlagUrl('AZ') },
	{ code: 'BS', name: 'Bahamas', nameAr: 'البهاما', dialCode: '+1', flagUrl: getFlagUrl('BS') },
	{ code: 'BH', name: 'Bahrain', nameAr: 'البحرين', dialCode: '+973', flagUrl: getFlagUrl('BH') },
	{ code: 'BD', name: 'Bangladesh', nameAr: 'بنغلاديش', dialCode: '+880', flagUrl: getFlagUrl('BD') },
	{ code: 'BB', name: 'Barbados', nameAr: 'بربادوس', dialCode: '+1', flagUrl: getFlagUrl('BB') },
	{ code: 'BY', name: 'Belarus', nameAr: 'بيلاروس', dialCode: '+375', flagUrl: getFlagUrl('BY') },
	{ code: 'BE', name: 'Belgium', nameAr: 'بلجيكا', dialCode: '+32', flagUrl: getFlagUrl('BE') },
	{ code: 'BZ', name: 'Belize', nameAr: 'بليز', dialCode: '+501', flagUrl: getFlagUrl('BZ') },
	{ code: 'BJ', name: 'Benin', nameAr: 'بنين', dialCode: '+229', flagUrl: getFlagUrl('BJ') },
	{ code: 'BT', name: 'Bhutan', nameAr: 'بوتان', dialCode: '+975', flagUrl: getFlagUrl('BT') },
	{ code: 'BO', name: 'Bolivia', nameAr: 'بوليفيا', dialCode: '+591', flagUrl: getFlagUrl('BO') },
	{ code: 'BA', name: 'Bosnia and Herzegovina', nameAr: 'البوسنة والهرسك', dialCode: '+387', flagUrl: getFlagUrl('BA') },
	{ code: 'BW', name: 'Botswana', nameAr: 'بوتسوانا', dialCode: '+267', flagUrl: getFlagUrl('BW') },
	{ code: 'BR', name: 'Brazil', nameAr: 'البرازيل', dialCode: '+55', flagUrl: getFlagUrl('BR') },
	{ code: 'BN', name: 'Brunei', nameAr: 'بروناي', dialCode: '+673', flagUrl: getFlagUrl('BN') },
	{ code: 'BG', name: 'Bulgaria', nameAr: 'بلغاريا', dialCode: '+359', flagUrl: getFlagUrl('BG') },
	{ code: 'BF', name: 'Burkina Faso', nameAr: 'بوركينا فاسو', dialCode: '+226', flagUrl: getFlagUrl('BF') },
	{ code: 'KH', name: 'Cambodia', nameAr: 'كمبوديا', dialCode: '+855', flagUrl: getFlagUrl('KH') },
	{ code: 'CM', name: 'Cameroon', nameAr: 'الكاميرون', dialCode: '+237', flagUrl: getFlagUrl('CM') },
	{ code: 'CA', name: 'Canada', nameAr: 'كندا', dialCode: '+1', flagUrl: getFlagUrl('CA') },
	{ code: 'CV', name: 'Cape Verde', nameAr: 'الرأس الأخضر', dialCode: '+238', flagUrl: getFlagUrl('CV') },
	{ code: 'CF', name: 'Central African Republic', nameAr: 'جمهورية أفريقيا الوسطى', dialCode: '+236', flagUrl: getFlagUrl('CF') },
	{ code: 'TD', name: 'Chad', nameAr: 'تشاد', dialCode: '+235', flagUrl: getFlagUrl('TD') },
	{ code: 'CL', name: 'Chile', nameAr: 'تشيلي', dialCode: '+56', flagUrl: getFlagUrl('CL') },
	{ code: 'CN', name: 'China', nameAr: 'الصين', dialCode: '+86', flagUrl: getFlagUrl('CN') },
	{ code: 'CO', name: 'Colombia', nameAr: 'كولومبيا', dialCode: '+57', flagUrl: getFlagUrl('CO') },
	{ code: 'KM', name: 'Comoros', nameAr: 'جزر القمر', dialCode: '+269', flagUrl: getFlagUrl('KM') },
	{ code: 'CG', name: 'Congo', nameAr: 'الكونغو', dialCode: '+242', flagUrl: getFlagUrl('CG') },
	{ code: 'CD', name: 'DR Congo', nameAr: 'جمهورية الكونغو الديمقراطية', dialCode: '+243', flagUrl: getFlagUrl('CD') },
	{ code: 'CR', name: 'Costa Rica', nameAr: 'كوستاريكا', dialCode: '+506', flagUrl: getFlagUrl('CR') },
	{ code: 'CI', name: 'Ivory Coast', nameAr: 'ساحل العاج', dialCode: '+225', flagUrl: getFlagUrl('CI') },
	{ code: 'HR', name: 'Croatia', nameAr: 'كرواتيا', dialCode: '+385', flagUrl: getFlagUrl('HR') },
	{ code: 'CU', name: 'Cuba', nameAr: 'كوبا', dialCode: '+53', flagUrl: getFlagUrl('CU') },
	{ code: 'CY', name: 'Cyprus', nameAr: 'قبرص', dialCode: '+357', flagUrl: getFlagUrl('CY') },
	{ code: 'CZ', name: 'Czech Republic', nameAr: 'جمهورية التشيك', dialCode: '+420', flagUrl: getFlagUrl('CZ') },
	{ code: 'DK', name: 'Denmark', nameAr: 'الدنمارك', dialCode: '+45', flagUrl: getFlagUrl('DK') },
	{ code: 'DJ', name: 'Djibouti', nameAr: 'جيبوتي', dialCode: '+253', flagUrl: getFlagUrl('DJ') },
	{ code: 'DM', name: 'Dominica', nameAr: 'دومينيكا', dialCode: '+1', flagUrl: getFlagUrl('DM') },
	{ code: 'DO', name: 'Dominican Republic', nameAr: 'جمهورية الدومينيكان', dialCode: '+1', flagUrl: getFlagUrl('DO') },
	{ code: 'EC', name: 'Ecuador', nameAr: 'الإكوادور', dialCode: '+593', flagUrl: getFlagUrl('EC') },
	{ code: 'EG', name: 'Egypt', nameAr: 'مصر', dialCode: '+20', flagUrl: getFlagUrl('EG') },
	{ code: 'SV', name: 'El Salvador', nameAr: 'السلفادور', dialCode: '+503', flagUrl: getFlagUrl('SV') },
	{ code: 'GQ', name: 'Equatorial Guinea', nameAr: 'غينيا الاستوائية', dialCode: '+240', flagUrl: getFlagUrl('GQ') },
	{ code: 'ER', name: 'Eritrea', nameAr: 'إريتريا', dialCode: '+291', flagUrl: getFlagUrl('ER') },
	{ code: 'EE', name: 'Estonia', nameAr: 'إستونيا', dialCode: '+372', flagUrl: getFlagUrl('EE') },
	{ code: 'ET', name: 'Ethiopia', nameAr: 'إثيوبيا', dialCode: '+251', flagUrl: getFlagUrl('ET') },
	{ code: 'FK', name: 'Falkland Islands', nameAr: 'جزر فوكلاند', dialCode: '+500', flagUrl: getFlagUrl('FK') },
	{ code: 'FJ', name: 'Fiji', nameAr: 'فيجي', dialCode: '+679', flagUrl: getFlagUrl('FJ') },
	{ code: 'FI', name: 'Finland', nameAr: 'فنلندا', dialCode: '+358', flagUrl: getFlagUrl('FI') },
	{ code: 'FR', name: 'France', nameAr: 'فرنسا', dialCode: '+33', flagUrl: getFlagUrl('FR') },
	{ code: 'GF', name: 'French Guiana', nameAr: 'غيانا الفرنسية', dialCode: '+594', flagUrl: getFlagUrl('GF') },
	{ code: 'PF', name: 'French Polynesia', nameAr: 'بولينيزيا الفرنسية', dialCode: '+689', flagUrl: getFlagUrl('PF') },
	{ code: 'GA', name: 'Gabon', nameAr: 'الغابون', dialCode: '+241', flagUrl: getFlagUrl('GA') },
	{ code: 'GE', name: 'Georgia', nameAr: 'جورجيا', dialCode: '+995', flagUrl: getFlagUrl('GE') },
	{ code: 'DE', name: 'Germany', nameAr: 'ألمانيا', dialCode: '+49', flagUrl: getFlagUrl('DE') },
	{ code: 'GH', name: 'Ghana', nameAr: 'غانا', dialCode: '+233', flagUrl: getFlagUrl('GH') },
	{ code: 'GR', name: 'Greece', nameAr: 'اليونان', dialCode: '+30', flagUrl: getFlagUrl('GR') },
	{ code: 'GD', name: 'Grenada', nameAr: 'غرينادا', dialCode: '+1', flagUrl: getFlagUrl('GD') },
	{ code: 'GN', name: 'Guinea', nameAr: 'غينيا', dialCode: '+224', flagUrl: getFlagUrl('GN') },
	{ code: 'GW', name: 'Guinea-Bissau', nameAr: 'غينيا بيساو', dialCode: '+245', flagUrl: getFlagUrl('GW') },
	{ code: 'GT', name: 'Guatemala', nameAr: 'غواتيمالا', dialCode: '+502', flagUrl: getFlagUrl('GT') },
	{ code: 'GY', name: 'Guyana', nameAr: 'غيانا', dialCode: '+592', flagUrl: getFlagUrl('GY') },
	{ code: 'HT', name: 'Haiti', nameAr: 'هايتي', dialCode: '+509', flagUrl: getFlagUrl('HT') },
	{ code: 'HN', name: 'Honduras', nameAr: 'هندوراس', dialCode: '+504', flagUrl: getFlagUrl('HN') },
	{ code: 'HK', name: 'Hong Kong', nameAr: 'هونغ كونغ', dialCode: '+852', flagUrl: getFlagUrl('HK') },
	{ code: 'HU', name: 'Hungary', nameAr: 'المجر', dialCode: '+36', flagUrl: getFlagUrl('HU') },
	{ code: 'IS', name: 'Iceland', nameAr: 'آيسلندا', dialCode: '+354', flagUrl: getFlagUrl('IS') },
	{ code: 'IN', name: 'India', nameAr: 'الهند', dialCode: '+91', flagUrl: getFlagUrl('IN') },
	{ code: 'ID', name: 'Indonesia', nameAr: 'إندونيسيا', dialCode: '+62', flagUrl: getFlagUrl('ID') },
	{ code: 'IR', name: 'Iran', nameAr: 'إيران', dialCode: '+98', flagUrl: getFlagUrl('IR') },
	{ code: 'IQ', name: 'Iraq', nameAr: 'العراق', dialCode: '+964', flagUrl: getFlagUrl('IQ') },
	{ code: 'IE', name: 'Ireland', nameAr: 'أيرلندا', dialCode: '+353', flagUrl: getFlagUrl('IE') },
	{ code: 'IL', name: 'Israel', nameAr: 'إسرائيل', dialCode: '+972', flagUrl: getFlagUrl('IL') },
	{ code: 'IT', name: 'Italy', nameAr: 'إيطاليا', dialCode: '+39', flagUrl: getFlagUrl('IT') },
	{ code: 'JM', name: 'Jamaica', nameAr: 'جامايكا', dialCode: '+1', flagUrl: getFlagUrl('JM') },
	{ code: 'JP', name: 'Japan', nameAr: 'اليابان', dialCode: '+81', flagUrl: getFlagUrl('JP') },
	{ code: 'JO', name: 'Jordan', nameAr: 'الأردن', dialCode: '+962', flagUrl: getFlagUrl('JO') },
	{ code: 'KZ', name: 'Kazakhstan', nameAr: 'كازاخستان', dialCode: '+7', flagUrl: getFlagUrl('KZ') },
	{ code: 'KE', name: 'Kenya', nameAr: 'كينيا', dialCode: '+254', flagUrl: getFlagUrl('KE') },
	{ code: 'KI', name: 'Kiribati', nameAr: 'كيريباتي', dialCode: '+686', flagUrl: getFlagUrl('KI') },
	{ code: 'KP', name: 'North Korea', nameAr: 'كوريا الشمالية', dialCode: '+850', flagUrl: getFlagUrl('KP') },
	{ code: 'KR', name: 'South Korea', nameAr: 'كوريا الجنوبية', dialCode: '+82', flagUrl: getFlagUrl('KR') },
	{ code: 'KW', name: 'Kuwait', nameAr: 'الكويت', dialCode: '+965', flagUrl: getFlagUrl('KW') },
	{ code: 'KG', name: 'Kyrgyzstan', nameAr: 'قرغيزستان', dialCode: '+996', flagUrl: getFlagUrl('KG') },
	{ code: 'LA', name: 'Laos', nameAr: 'لاوس', dialCode: '+856', flagUrl: getFlagUrl('LA') },
	{ code: 'LV', name: 'Latvia', nameAr: 'لاتفيا', dialCode: '+371', flagUrl: getFlagUrl('LV') },
	{ code: 'LB', name: 'Lebanon', nameAr: 'لبنان', dialCode: '+961', flagUrl: getFlagUrl('LB') },
	{ code: 'LR', name: 'Liberia', nameAr: 'ليبيريا', dialCode: '+231', flagUrl: getFlagUrl('LR') },
	{ code: 'LY', name: 'Libya', nameAr: 'ليبيا', dialCode: '+218', flagUrl: getFlagUrl('LY') },
	{ code: 'LT', name: 'Lithuania', nameAr: 'ليتوانيا', dialCode: '+370', flagUrl: getFlagUrl('LT') },
	{ code: 'LU', name: 'Luxembourg', nameAr: 'لوكسمبورغ', dialCode: '+352', flagUrl: getFlagUrl('LU') },
	{ code: 'MO', name: 'Macau', nameAr: 'ماكاو', dialCode: '+853', flagUrl: getFlagUrl('MO') },
	{ code: 'MK', name: 'North Macedonia', nameAr: 'مقدونيا الشمالية', dialCode: '+389', flagUrl: getFlagUrl('MK') },
	{ code: 'MG', name: 'Madagascar', nameAr: 'مدغشقر', dialCode: '+261', flagUrl: getFlagUrl('MG') },
	{ code: 'MY', name: 'Malaysia', nameAr: 'ماليزيا', dialCode: '+60', flagUrl: getFlagUrl('MY') },
	{ code: 'MV', name: 'Maldives', nameAr: 'جزر المالديف', dialCode: '+960', flagUrl: getFlagUrl('MV') },
	{ code: 'ML', name: 'Mali', nameAr: 'مالي', dialCode: '+223', flagUrl: getFlagUrl('ML') },
	{ code: 'MT', name: 'Malta', nameAr: 'مالطا', dialCode: '+356', flagUrl: getFlagUrl('MT') },
	{ code: 'MH', name: 'Marshall Islands', nameAr: 'جزر مارشال', dialCode: '+692', flagUrl: getFlagUrl('MH') },
	{ code: 'MR', name: 'Mauritania', nameAr: 'موريتانيا', dialCode: '+222', flagUrl: getFlagUrl('MR') },
	{ code: 'MU', name: 'Mauritius', nameAr: 'موريشيوس', dialCode: '+230', flagUrl: getFlagUrl('MU') },
	{ code: 'MX', name: 'Mexico', nameAr: 'المكسيك', dialCode: '+52', flagUrl: getFlagUrl('MX') },
	{ code: 'FM', name: 'Micronesia', nameAr: 'ميكرونيزيا', dialCode: '+691', flagUrl: getFlagUrl('FM') },
	{ code: 'MD', name: 'Moldova', nameAr: 'مولدوفا', dialCode: '+373', flagUrl: getFlagUrl('MD') },
	{ code: 'MN', name: 'Mongolia', nameAr: 'منغوليا', dialCode: '+976', flagUrl: getFlagUrl('MN') },
	{ code: 'ME', name: 'Montenegro', nameAr: 'الجبل الأسود', dialCode: '+382', flagUrl: getFlagUrl('ME') },
	{ code: 'MA', name: 'Morocco', nameAr: 'المغرب', dialCode: '+212', flagUrl: getFlagUrl('MA') },
	{ code: 'MZ', name: 'Mozambique', nameAr: 'موزمبيق', dialCode: '+258', flagUrl: getFlagUrl('MZ') },
	{ code: 'MM', name: 'Myanmar', nameAr: 'ميانمار', dialCode: '+95', flagUrl: getFlagUrl('MM') },
	{ code: 'NA', name: 'Namibia', nameAr: 'ناميبيا', dialCode: '+264', flagUrl: getFlagUrl('NA') },
	{ code: 'NR', name: 'Nauru', nameAr: 'ناورو', dialCode: '+674', flagUrl: getFlagUrl('NR') },
	{ code: 'NP', name: 'Nepal', nameAr: 'نيبال', dialCode: '+977', flagUrl: getFlagUrl('NP') },
	{ code: 'NL', name: 'Netherlands', nameAr: 'هولندا', dialCode: '+31', flagUrl: getFlagUrl('NL') },
	{ code: 'NC', name: 'New Caledonia', nameAr: 'كاليدونيا الجديدة', dialCode: '+687', flagUrl: getFlagUrl('NC') },
	{ code: 'NZ', name: 'New Zealand', nameAr: 'نيوزيلندا', dialCode: '+64', flagUrl: getFlagUrl('NZ') },
	{ code: 'NI', name: 'Nicaragua', nameAr: 'نيكاراغوا', dialCode: '+505', flagUrl: getFlagUrl('NI') },
	{ code: 'NE', name: 'Niger', nameAr: 'النيجر', dialCode: '+227', flagUrl: getFlagUrl('NE') },
	{ code: 'NG', name: 'Nigeria', nameAr: 'نيجيريا', dialCode: '+234', flagUrl: getFlagUrl('NG') },
	{ code: 'NO', name: 'Norway', nameAr: 'النرويج', dialCode: '+47', flagUrl: getFlagUrl('NO') },
	{ code: 'OM', name: 'Oman', nameAr: 'عُمان', dialCode: '+968', flagUrl: getFlagUrl('OM') },
	{ code: 'PK', name: 'Pakistan', nameAr: 'باكستان', dialCode: '+92', flagUrl: getFlagUrl('PK') },
	{ code: 'PW', name: 'Palau', nameAr: 'بالاو', dialCode: '+680', flagUrl: getFlagUrl('PW') },
	{ code: 'PS', name: 'Palestine', nameAr: 'فلسطين', dialCode: '+970', flagUrl: getFlagUrl('PS') },
	{ code: 'PA', name: 'Panama', nameAr: 'بنما', dialCode: '+507', flagUrl: getFlagUrl('PA') },
	{ code: 'PG', name: 'Papua New Guinea', nameAr: 'بابوا غينيا الجديدة', dialCode: '+675', flagUrl: getFlagUrl('PG') },
	{ code: 'PY', name: 'Paraguay', nameAr: 'باراغواي', dialCode: '+595', flagUrl: getFlagUrl('PY') },
	{ code: 'PE', name: 'Peru', nameAr: 'بيرو', dialCode: '+51', flagUrl: getFlagUrl('PE') },
	{ code: 'PH', name: 'Philippines', nameAr: 'الفلبين', dialCode: '+63', flagUrl: getFlagUrl('PH') },
	{ code: 'PL', name: 'Poland', nameAr: 'بولندا', dialCode: '+48', flagUrl: getFlagUrl('PL') },
	{ code: 'PT', name: 'Portugal', nameAr: 'البرتغال', dialCode: '+351', flagUrl: getFlagUrl('PT') },
	{ code: 'PR', name: 'Puerto Rico', nameAr: 'بورتوريكو', dialCode: '+1', flagUrl: getFlagUrl('PR') },
	{ code: 'QA', name: 'Qatar', nameAr: 'قطر', dialCode: '+974', flagUrl: getFlagUrl('QA') },
	{ code: 'RO', name: 'Romania', nameAr: 'رومانيا', dialCode: '+40', flagUrl: getFlagUrl('RO') },
	{ code: 'RU', name: 'Russia', nameAr: 'روسيا', dialCode: '+7', flagUrl: getFlagUrl('RU') },
	{ code: 'RW', name: 'Rwanda', nameAr: 'رواندا', dialCode: '+250', flagUrl: getFlagUrl('RW') },
	{ code: 'KN', name: 'Saint Kitts and Nevis', nameAr: 'سانت كيتس ونيفيس', dialCode: '+1', flagUrl: getFlagUrl('KN') },
	{ code: 'LC', name: 'Saint Lucia', nameAr: 'سانت لوسيا', dialCode: '+1', flagUrl: getFlagUrl('LC') },
	{ code: 'VC', name: 'Saint Vincent', nameAr: 'سانت فنسنت', dialCode: '+1', flagUrl: getFlagUrl('VC') },
	{ code: 'WS', name: 'Samoa', nameAr: 'ساموا', dialCode: '+685', flagUrl: getFlagUrl('WS') },
	{ code: 'ST', name: 'São Tomé and Príncipe', nameAr: 'ساو تومي وبرينسيب', dialCode: '+239', flagUrl: getFlagUrl('ST') },
	{ code: 'SA', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', dialCode: '+966', flagUrl: getFlagUrl('SA') },
	{ code: 'SN', name: 'Senegal', nameAr: 'السنغال', dialCode: '+221', flagUrl: getFlagUrl('SN') },
	{ code: 'RS', name: 'Serbia', nameAr: 'صربيا', dialCode: '+381', flagUrl: getFlagUrl('RS') },
	{ code: 'SC', name: 'Seychelles', nameAr: 'سيشل', dialCode: '+248', flagUrl: getFlagUrl('SC') },
	{ code: 'SL', name: 'Sierra Leone', nameAr: 'سيراليون', dialCode: '+232', flagUrl: getFlagUrl('SL') },
	{ code: 'SG', name: 'Singapore', nameAr: 'سنغافورة', dialCode: '+65', flagUrl: getFlagUrl('SG') },
	{ code: 'SK', name: 'Slovakia', nameAr: 'سلوفاكيا', dialCode: '+421', flagUrl: getFlagUrl('SK') },
	{ code: 'SI', name: 'Slovenia', nameAr: 'سلوفينيا', dialCode: '+386', flagUrl: getFlagUrl('SI') },
	{ code: 'SB', name: 'Solomon Islands', nameAr: 'جزر سليمان', dialCode: '+677', flagUrl: getFlagUrl('SB') },
	{ code: 'SO', name: 'Somalia', nameAr: 'الصومال', dialCode: '+252', flagUrl: getFlagUrl('SO') },
	{ code: 'ZA', name: 'South Africa', nameAr: 'جنوب أفريقيا', dialCode: '+27', flagUrl: getFlagUrl('ZA') },
	{ code: 'SS', name: 'South Sudan', nameAr: 'جنوب السودان', dialCode: '+211', flagUrl: getFlagUrl('SS') },
	{ code: 'ES', name: 'Spain', nameAr: 'إسبانيا', dialCode: '+34', flagUrl: getFlagUrl('ES') },
	{ code: 'LK', name: 'Sri Lanka', nameAr: 'سريلانكا', dialCode: '+94', flagUrl: getFlagUrl('LK') },
	{ code: 'SD', name: 'Sudan', nameAr: 'السودان', dialCode: '+249', flagUrl: getFlagUrl('SD') },
	{ code: 'SR', name: 'Suriname', nameAr: 'سورينام', dialCode: '+597', flagUrl: getFlagUrl('SR') },
	{ code: 'SY', name: 'Syria', nameAr: 'سوريا', dialCode: '+963', flagUrl: getFlagUrl('SY') },
	{ code: 'TW', name: 'Taiwan', nameAr: 'تايوان', dialCode: '+886', flagUrl: getFlagUrl('TW') },
	{ code: 'TJ', name: 'Tajikistan', nameAr: 'طاجيكستان', dialCode: '+992', flagUrl: getFlagUrl('TJ') },
	{ code: 'TZ', name: 'Tanzania', nameAr: 'تنزانيا', dialCode: '+255', flagUrl: getFlagUrl('TZ') },
	{ code: 'TH', name: 'Thailand', nameAr: 'تايلاند', dialCode: '+66', flagUrl: getFlagUrl('TH') },
	{ code: 'TL', name: 'East Timor', nameAr: 'تيمور الشرقية', dialCode: '+670', flagUrl: getFlagUrl('TL') },
	{ code: 'TG', name: 'Togo', nameAr: 'توغو', dialCode: '+228', flagUrl: getFlagUrl('TG') },
	{ code: 'TO', name: 'Tonga', nameAr: 'تونغا', dialCode: '+676', flagUrl: getFlagUrl('TO') },
	{ code: 'TT', name: 'Trinidad and Tobago', nameAr: 'ترينيداد وتوباغو', dialCode: '+1', flagUrl: getFlagUrl('TT') },
	{ code: 'TN', name: 'Tunisia', nameAr: 'تونس', dialCode: '+216', flagUrl: getFlagUrl('TN') },
	{ code: 'TR', name: 'Turkey', nameAr: 'تركيا', dialCode: '+90', flagUrl: getFlagUrl('TR') },
	{ code: 'TM', name: 'Turkmenistan', nameAr: 'تركمانستان', dialCode: '+993', flagUrl: getFlagUrl('TM') },
	{ code: 'TV', name: 'Tuvalu', nameAr: 'توفالو', dialCode: '+688', flagUrl: getFlagUrl('TV') },
	{ code: 'UG', name: 'Uganda', nameAr: 'أوغندا', dialCode: '+256', flagUrl: getFlagUrl('UG') },
	{ code: 'UA', name: 'Ukraine', nameAr: 'أوكرانيا', dialCode: '+380', flagUrl: getFlagUrl('UA') },
	{ code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', dialCode: '+971', flagUrl: getFlagUrl('AE') },
	{ code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة', dialCode: '+44', flagUrl: getFlagUrl('GB') },
	{ code: 'US', name: 'United States', nameAr: 'الولايات المتحدة', dialCode: '+1', flagUrl: getFlagUrl('US') },
	{ code: 'UY', name: 'Uruguay', nameAr: 'الأوروغواي', dialCode: '+598', flagUrl: getFlagUrl('UY') },
	{ code: 'UZ', name: 'Uzbekistan', nameAr: 'أوزبكستان', dialCode: '+998', flagUrl: getFlagUrl('UZ') },
	{ code: 'VU', name: 'Vanuatu', nameAr: 'فانواتو', dialCode: '+678', flagUrl: getFlagUrl('VU') },
	{ code: 'VE', name: 'Venezuela', nameAr: 'فنزويلا', dialCode: '+58', flagUrl: getFlagUrl('VE') },
	{ code: 'VN', name: 'Vietnam', nameAr: 'فيتنام', dialCode: '+84', flagUrl: getFlagUrl('VN') },
	{ code: 'YE', name: 'Yemen', nameAr: 'اليمن', dialCode: '+967', flagUrl: getFlagUrl('YE') },
	{ code: 'ZM', name: 'Zambia', nameAr: 'زامبيا', dialCode: '+260', flagUrl: getFlagUrl('ZM') },
	{ code: 'ZW', name: 'Zimbabwe', nameAr: 'زيمبابوي', dialCode: '+263', flagUrl: getFlagUrl('ZW') },
].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Returns countries array with preferred countries moved to the top
 * @param preferredCodes - Array of country codes to prioritize (e.g., ['SA', 'AE', 'KW'])
 * @returns New array with preferred countries first, followed by the rest in original order
 */
export function getCountriesWithPreferred(preferredCodes: string[]): ICountry[] {
	if (!preferredCodes || preferredCodes.length === 0) {
		return [...COUNTRIES];
	}

	const preferredCountries: ICountry[] = [];
	const otherCountries: ICountry[] = [];
	const preferredSet = new Set(preferredCodes);

	// Separate preferred and other countries
	for (const country of COUNTRIES) {
		if (preferredSet.has(country.code)) {
			preferredCountries.push(country);
		} else {
			otherCountries.push(country);
		}
	}

	// Sort preferred countries according to the order in preferredCodes array
	preferredCountries.sort((a, b) => {
		const indexA = preferredCodes.indexOf(a.code);
		const indexB = preferredCodes.indexOf(b.code);
		return indexA - indexB;
	});

	// Return preferred countries first, then the rest
	return [...preferredCountries, ...otherCountries];
}

/**
 * Gets a country by its country code
 * @param code - The country code (e.g., 'SA', 'US', 'AE')
 * @returns The country object if found, undefined otherwise
 */
export function getCountryByCode(code: string): ICountry | undefined {
	if (!code) {
		return undefined;
	}
	return COUNTRIES.find(country => country.code === code.toUpperCase());
}

/**
 * Parses a concatenated string of country dial code and phone number
 * Intelligently extracts the dial code and phone number by matching against known dial codes
 * 
 * @param phoneString - The concatenated string (e.g., "+966501234567", "966501234567", "00966501234567")
 * @returns An object with countryCode (dial code like "+966") and phoneNumber, or null if parsing fails
 * 
 * @example
 * parsePhoneNumber("+966501234567") // { countryCode: '+966', phoneNumber: '501234567' }
 * parsePhoneNumber("966501234567")  // { countryCode: '+966', phoneNumber: '501234567' }
 * parsePhoneNumber("00966501234567") // { countryCode: '+966', phoneNumber: '501234567' }
 */
export function parsePhoneNumber(phoneString: string): { countryCode: string; phoneNumber: string } | null {
	if (!phoneString || typeof phoneString !== 'string') {
		return null;
	}

	// Normalize the input: remove spaces, remove leading +, remove leading 00
	let normalized = phoneString.trim().replace(/^\+/, '').replace(/^00/, '');

	// Remove all non-digit characters except for potential leading + or 00
	normalized = normalized.replace(/\D/g, '');

	if (!normalized || normalized.length < 4) {
		// Too short to contain a valid dial code and phone number
		return null;
	}

	// Create a map of dial codes to countries, sorted by length (longest first)
	// This ensures we match longer codes before shorter ones (e.g., +966 before +9)
	const dialCodeMap = new Map<string, ICountry[]>();

	for (const country of COUNTRIES) {
		const dialCode = country.dialCode.replace(/^\+/, ''); // Remove + if present
		if (!dialCodeMap.has(dialCode)) {
			dialCodeMap.set(dialCode, []);
		}
		dialCodeMap.get(dialCode)!.push(country);
	}

	// Sort dial codes by length (longest first) to match more specific codes first
	const sortedDialCodes = Array.from(dialCodeMap.keys()).sort((a, b) => b.length - a.length);

	// Try to match dial codes from longest to shortest
	for (const dialCode of sortedDialCodes) {
		if (normalized.startsWith(dialCode)) {
			const phoneNumber = normalized.substring(dialCode.length);

			// Validate that we have a phone number after the dial code
			if (phoneNumber.length >= 4) {
				// If multiple countries share the same dial code, prefer common ones
				// You can customize this logic based on your needs
				const countries = dialCodeMap.get(dialCode)!;
				const country = countries[0]; // Use first match, or implement priority logic

				return {
					countryCode: country.dialCode, // Return dial code (e.g., "+966") instead of country code (e.g., "SA")
					phoneNumber: phoneNumber
				};
			}
		}
	}

	// If no match found, return null
	return null;
}