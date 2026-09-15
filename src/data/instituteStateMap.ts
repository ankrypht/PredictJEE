export interface InstituteInfo {
  name: string;
  type: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'SFTI' | 'IISc';
  state: string;
}

export const INSTITUTE_STATE_MAP: Record<number, InstituteInfo> = {
  1: {
    name: 'Assam University, Silchar',
    type: 'GFTI',
    state: 'Assam'
  },
  2: {
    name: 'Birla Institute of Technology, Mesra, Ranchi',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  3: {
    name: 'Gurukula Kangri Vishwavidyalaya, Haridwar',
    type: 'GFTI',
    state: 'Uttarakhand'
  },
  4: {
    name: 'Indian Institute of Carpet Technology, Bhadohi',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  5: {
    name: 'Institute of Infrastructure, Technology, Research and Management-Ahmedabad',
    type: 'GFTI',
    state: 'Gujarat'
  },
  6: {
    name: 'School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  7: {
    name: 'J.K. Institute of Applied Physics & Technology, Department of Electronics & Communication, University of Allahabad- Allahabad',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  8: {
    name: 'National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)',
    type: 'GFTI',
    state: 'Maharashtra'
  },
  9: {
    name: 'National Institute of Advanced Manufacturing Technology, Ranchi',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  10: {
    name: 'Sant Longowal Institute of Engineering and Technology',
    type: 'GFTI',
    state: 'Punjab'
  },
  11: {
    name: 'Mizoram University, Aizawl',
    type: 'GFTI',
    state: 'Mizoram'
  },
  12: {
    name: 'School of Engineering, Tezpur University, Napaam, Tezpur',
    type: 'GFTI',
    state: 'Assam'
  },
  13: {
    name: 'School of Planning & Architecture, Bhopal',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  14: {
    name: 'School of Planning & Architecture, New Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  15: {
    name: 'School of Planning & Architecture: Vijayawada',
    type: 'GFTI',
    state: 'Andhra Pradesh'
  },
  16: {
    name: 'Shri Mata Vaishno Devi University, Katra, Jammu & Kashmir',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  17: {
    name: 'International Institute of Information Technology, Naya Raipur',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  18: {
    name: 'University of Hyderabad',
    type: 'GFTI',
    state: 'Telangana'
  },
  19: {
    name: 'Punjab Engineering College, Chandigarh',
    type: 'GFTI',
    state: 'Chandigarh'
  },
  20: {
    name: 'Jawaharlal Nehru University, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  21: {
    name: 'International Institute of Information Technology, Bhubaneswar',
    type: 'GFTI',
    state: 'Odisha'
  },
  22: {
    name: 'Central institute of Technology Kokrajar, Assam',
    type: 'GFTI',
    state: 'Assam'
  },
  23: {
    name: 'Puducherry Technological University, Puducherry',
    type: 'GFTI',
    state: 'Puducherry'
  },
  24: {
    name: 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal',
    type: 'GFTI',
    state: 'West Bengal'
  },
  25: {
    name: 'Central University of Rajasthan, Rajasthan',
    type: 'GFTI',
    state: 'Rajasthan'
  },
  26: {
    name: 'National Institute of Food Technology Entrepreneurship and Management, Kundli',
    type: 'GFTI',
    state: 'Haryana'
  },
  27: {
    name: 'National Institute of Food Technology Entrepreneurship and Management, Thanjavur',
    type: 'GFTI',
    state: 'Tamil Nadu'
  },
  28: {
    name: 'North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar),Arunachal Pradesh',
    type: 'GFTI',
    state: 'Arunachal Pradesh'
  },
  29: {
    name: 'Indian Institute of Handloom Technology(IIHT), Varanasi',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  30: {
    name: 'Chhattisgarh Swami Vivekanada Technical University, Bhilai (CSVTU Bhilai)',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  31: {
    name: 'Institute of Chemical Technology, Mumbai: Indian Oil Odisha Campus, Bhubaneswar',
    type: 'GFTI',
    state: 'Odisha'
  },
  32: {
    name: 'North-Eastern Hill University, Shillong',
    type: 'GFTI',
    state: 'Meghalaya'
  },
  33: {
    name: 'Central University of Jammu',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  34: {
    name: 'Institute of Engineering and Technology, Dr. H. S. Gour University. Sagar (A Central University)',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  35: {
    name: 'Central University of Haryana',
    type: 'GFTI',
    state: 'Haryana'
  },
  36: {
    name: 'Birla Institute of Technology, Deoghar Off-Campus',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  37: {
    name: 'Birla Institute of Technology, Patna Off-Campus',
    type: 'GFTI',
    state: 'Bihar'
  },
  38: {
    name: 'Indian Institute of Handloom Technology, Salem',
    type: 'GFTI',
    state: 'Tamil Nadu'
  },
  39: {
    name: 'Gati Shakti Vishwavidyalaya, Vadodara',
    type: 'GFTI',
    state: 'Gujarat'
  },
  40: {
    name: 'CU Jharkhand',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  41: {
    name: 'National Institute of Electronics and Information Technology, Ropar (Punjab)',
    type: 'GFTI',
    state: 'Punjab'
  },
  42: {
    name: 'National Institute of Electronics and Information Technology, Patna (Bihar)',
    type: 'GFTI',
    state: 'Bihar'
  },
  43: {
    name: 'National Institute of Electronics and Information Technology, Ajmer (Rajasthan)',
    type: 'GFTI',
    state: 'Rajasthan'
  },
  44: {
    name: 'National Institute of Electronics and Information Technology, Gorakhpur (UP)',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  45: {
    name: 'Rajiv Gandhi National Aviation University, Fursatganj, Amethi (UP)',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  46: {
    name: 'Islamic University of Science and Technology Kashmir',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  47: {
    name: 'Shri G. S. Institute of Technology and Science Indore',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  48: {
    name: 'National Institute of Technical Teachers Training and Research Bhopal',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  49: {
    name: 'Central University of Karnataka',
    type: 'GFTI',
    state: 'Karnataka'
  },
  50: {
    name: 'National Institute of Electronics and Information Technology, Agartala',
    type: 'GFTI',
    state: 'Tripura'
  },
  51: {
    name: 'National Institute of Electronics and Information Technology, Aizawl',
    type: 'GFTI',
    state: 'Mizoram'
  },
  52: {
    name: 'National Institute of Electronics and Information Technology, Imphal',
    type: 'GFTI',
    state: 'Manipur'
  },
  53: {
    name: 'National Institute of Electronics and Information Technology, Calicut',
    type: 'GFTI',
    state: 'Kerala'
  },
  54: {
    name: 'National Institute of Electronics and Information Technology, Kohima',
    type: 'GFTI',
    state: 'Nagaland'
  },
  55: {
    name: 'National Institute of Electronics and Information Technology, Srinagar',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  56: {
    name: 'Central University of Punjab, Bathinda',
    type: 'GFTI',
    state: 'Punjab'
  },
  57: {
    name: 'Indian Institute of Technology Bhubaneswar',
    type: 'IIT',
    state: 'Odisha'
  },
  58: {
    name: 'Indian Institute of Technology Bombay',
    type: 'IIT',
    state: 'Maharashtra'
  },
  59: {
    name: 'Indian Institute of Technology Mandi',
    type: 'IIT',
    state: 'Himachal Pradesh'
  },
  60: {
    name: 'Indian Institute of Technology Delhi',
    type: 'IIT',
    state: 'Delhi'
  },
  61: {
    name: 'Indian Institute of Technology Indore',
    type: 'IIT',
    state: 'Madhya Pradesh'
  },
  62: {
    name: 'Indian Institute of Technology Kharagpur',
    type: 'IIT',
    state: 'West Bengal'
  },
  63: {
    name: 'Indian Institute of Technology Hyderabad',
    type: 'IIT',
    state: 'Telangana'
  },
  64: {
    name: 'Indian Institute of Technology Jodhpur',
    type: 'IIT',
    state: 'Rajasthan'
  },
  65: {
    name: 'Indian Institute of Technology Kanpur',
    type: 'IIT',
    state: 'Uttar Pradesh'
  },
  66: {
    name: 'Indian Institute of Technology Madras',
    type: 'IIT',
    state: 'Tamil Nadu'
  },
  67: {
    name: 'Indian Institute of Technology Gandhinagar',
    type: 'IIT',
    state: 'Gujarat'
  },
  68: {
    name: 'Indian Institute of Technology Patna',
    type: 'IIT',
    state: 'Bihar'
  },
  69: {
    name: 'Indian Institute of Technology Roorkee',
    type: 'IIT',
    state: 'Uttarakhand'
  },
  70: {
    name: 'Indian Institute of Technology (ISM) Dhanbad',
    type: 'IIT',
    state: 'Jharkhand'
  },
  71: {
    name: 'Indian Institute of Technology Ropar',
    type: 'IIT',
    state: 'Punjab'
  },
  72: {
    name: 'Indian Institute of Technology (BHU) Varanasi',
    type: 'IIT',
    state: 'Uttar Pradesh'
  },
  73: {
    name: 'Indian Institute of Technology Guwahati',
    type: 'IIT',
    state: 'Assam'
  },
  74: {
    name: 'Indian Institute of Technology Bhilai',
    type: 'IIT',
    state: 'Chhattisgarh'
  },
  75: {
    name: 'Indian Institute of Technology Goa',
    type: 'IIT',
    state: 'Goa'
  },
  76: {
    name: 'Indian Institute of Technology Palakkad',
    type: 'IIT',
    state: 'Kerala'
  },
  77: {
    name: 'Indian Institute of Technology Tirupati',
    type: 'IIT',
    state: 'Andhra Pradesh'
  },
  78: {
    name: 'Indian Institute of Technology Jammu',
    type: 'IIT',
    state: 'Jammu & Kashmir'
  },
  79: {
    name: 'Indian Institute of Technology Dharwad',
    type: 'IIT',
    state: 'Karnataka'
  },
  80: {
    name: 'Indian Institute of Science, Bangalore',
    type: 'IIT',
    state: 'Karnataka'
  },
  81: {
    name: 'Atal Bihari Vajpayee Indian Institute of Information Technology & Management Gwalior',
    type: 'IIIT',
    state: 'Madhya Pradesh'
  },
  82: {
    name: 'Indian Institute of Information Technology (IIIT)Kota, Rajasthan',
    type: 'IIIT',
    state: 'Rajasthan'
  },
  83: {
    name: 'Indian Institute of Information Technology Guwahati',
    type: 'IIIT',
    state: 'Assam'
  },
  84: {
    name: 'Indian Institute of Information Technology(IIIT) Kalyani, West Bengal',
    type: 'IIIT',
    state: 'West Bengal'
  },
  85: {
    name: 'Indian Institute of Information Technology(IIIT) Kilohrad, Sonepat, Haryana',
    type: 'IIIT',
    state: 'Haryana'
  },
  86: {
    name: 'Indian Institute of Information Technology(IIIT) Una, Himachal Pradesh',
    type: 'IIIT',
    state: 'Himachal Pradesh'
  },
  87: {
    name: 'Indian Institute of Information Technology (IIIT), Sri City, Chittoor',
    type: 'IIIT',
    state: 'Andhra Pradesh'
  },
  88: {
    name: 'Indian Institute of Information Technology(IIIT), Vadodara, Gujrat',
    type: 'IIIT',
    state: 'Gujarat'
  },
  89: {
    name: 'Indian Institute of Information Technology, Allahabad',
    type: 'IIIT',
    state: 'Uttar Pradesh'
  },
  90: {
    name: 'Indian Institute of Information Technology, Design & Manufacturing, Kancheepuram',
    type: 'IIIT',
    state: 'Tamil Nadu'
  },
  91: {
    name: 'Pt. Dwarka Prasad Mishra Indian Institute of Information Technology, Design & Manufacture Jabalpur',
    type: 'IIIT',
    state: 'Madhya Pradesh'
  },
  92: {
    name: 'INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR',
    type: 'IIIT',
    state: 'Manipur'
  },
  93: {
    name: 'Indian Institute of Information Technology Tiruchirappalli',
    type: 'IIIT',
    state: 'Tamil Nadu'
  },
  94: {
    name: 'Indian Institute of Information Technology Lucknow',
    type: 'IIIT',
    state: 'Uttar Pradesh'
  },
  95: {
    name: 'Indian Institute of Information Technology(IIIT) Dharwad',
    type: 'IIIT',
    state: 'Karnataka'
  },
  96: {
    name: 'Indian Institute of Information Technology Design & Manufacturing Kurnool, Andhra Pradesh',
    type: 'IIIT',
    state: 'Andhra Pradesh'
  },
  97: {
    name: 'Indian Institute of Information Technology(IIIT) Kottayam',
    type: 'IIIT',
    state: 'Kerala'
  },
  98: {
    name: 'Indian Institute of Information Technology (IIIT) Ranchi',
    type: 'IIIT',
    state: 'Jharkhand'
  },
  99: {
    name: 'Indian Institute of Information Technology (IIIT) Nagpur',
    type: 'IIIT',
    state: 'Maharashtra'
  },
  100: {
    name: 'Indian Institute of Information Technology (IIIT) Pune',
    type: 'IIIT',
    state: 'Maharashtra'
  },
  101: {
    name: 'Indian Institute of Information Technology Bhagalpur',
    type: 'IIIT',
    state: 'Bihar'
  },
  102: {
    name: 'Indian Institute of Information Technology Bhopal',
    type: 'IIIT',
    state: 'Madhya Pradesh'
  },
  103: {
    name: 'Indian Institute of Information Technology Surat',
    type: 'IIIT',
    state: 'Gujarat'
  },
  104: {
    name: 'Indian Institute of Information Technology, Agartala',
    type: 'IIIT',
    state: 'Tripura'
  },
  105: {
    name: 'Indian institute of information technology, Raichur, Karnataka',
    type: 'IIIT',
    state: 'Karnataka'
  },
  106: {
    name: 'Indian Institute of Information Technology, Vadodara International Campus Diu (IIITVICD)',
    type: 'IIIT',
    state: 'Dadra and Nagar Haveli and Daman and Diu'
  },
  107: {
    name: 'Dr. B R Ambedkar National Institute of Technology, Jalandhar',
    type: 'NIT',
    state: 'Punjab'
  },
  108: {
    name: 'Malaviya National Institute of Technology Jaipur',
    type: 'NIT',
    state: 'Rajasthan'
  },
  109: {
    name: 'Maulana Azad National Institute of Technology Bhopal',
    type: 'NIT',
    state: 'Madhya Pradesh'
  },
  110: {
    name: 'Motilal Nehru National Institute of Technology Allahabad',
    type: 'NIT',
    state: 'Uttar Pradesh'
  },
  111: {
    name: 'National Institute of Technology Agartala',
    type: 'NIT',
    state: 'Tripura'
  },
  112: {
    name: 'National Institute of Technology Calicut',
    type: 'NIT',
    state: 'Kerala'
  },
  113: {
    name: 'National Institute of Technology Delhi',
    type: 'NIT',
    state: 'Delhi'
  },
  114: {
    name: 'National Institute of Technology Durgapur',
    type: 'NIT',
    state: 'West Bengal'
  },
  115: {
    name: 'National Institute of Technology Goa',
    type: 'NIT',
    state: 'Goa'
  },
  116: {
    name: 'National Institute of Technology Hamirpur',
    type: 'NIT',
    state: 'Himachal Pradesh'
  },
  117: {
    name: 'National Institute of Technology Karnataka, Surathkal',
    type: 'NIT',
    state: 'Karnataka'
  },
  118: {
    name: 'National Institute of Technology Meghalaya',
    type: 'NIT',
    state: 'Meghalaya'
  },
  119: {
    name: 'National Institute of Technology Nagaland',
    type: 'NIT',
    state: 'Nagaland'
  },
  120: {
    name: 'National Institute of Technology Patna',
    type: 'NIT',
    state: 'Bihar'
  },
  121: {
    name: 'National Institute of Technology Puducherry',
    type: 'NIT',
    state: 'Puducherry'
  },
  122: {
    name: 'National Institute of Technology Raipur',
    type: 'NIT',
    state: 'Chhattisgarh'
  },
  123: {
    name: 'National Institute of Technology Sikkim',
    type: 'NIT',
    state: 'Sikkim'
  },
  124: {
    name: 'National Institute of Technology Arunachal Pradesh',
    type: 'NIT',
    state: 'Arunachal Pradesh'
  },
  125: {
    name: 'National Institute of Technology, Jamshedpur',
    type: 'NIT',
    state: 'Jharkhand'
  },
  126: {
    name: 'National Institute of Technology, Kurukshetra',
    type: 'NIT',
    state: 'Haryana'
  },
  127: {
    name: 'National Institute of Technology, Manipur',
    type: 'NIT',
    state: 'Manipur'
  },
  128: {
    name: 'National Institute of Technology, Mizoram',
    type: 'NIT',
    state: 'Mizoram'
  },
  129: {
    name: 'National Institute of Technology, Rourkela',
    type: 'NIT',
    state: 'Odisha'
  },
  130: {
    name: 'National Institute of Technology, Silchar',
    type: 'NIT',
    state: 'Assam'
  },
  131: {
    name: 'National Institute of Technology, Srinagar',
    type: 'NIT',
    state: 'Jammu & Kashmir'
  },
  132: {
    name: 'National Institute of Technology, Tiruchirappalli',
    type: 'NIT',
    state: 'Tamil Nadu'
  },
  133: {
    name: 'National Institute of Technology, Uttarakhand',
    type: 'NIT',
    state: 'Uttarakhand'
  },
  134: {
    name: 'National Institute of Technology, Warangal',
    type: 'NIT',
    state: 'Telangana'
  },
  135: {
    name: 'Sardar Vallabhbhai National Institute of Technology, Surat',
    type: 'NIT',
    state: 'Gujarat'
  },
  136: {
    name: 'Visvesvaraya National Institute of Technology, Nagpur',
    type: 'NIT',
    state: 'Maharashtra'
  },
  137: {
    name: 'National Institute of Technology, Andhra Pradesh',
    type: 'NIT',
    state: 'Andhra Pradesh'
  },
  138: {
    name: 'Indian Institute of Engineering Science and Technology, Shibpur',
    type: 'NIT',
    state: 'West Bengal'
  },
  139: {
    name: 'Delhi Technological University, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  140: {
    name: 'Indian Maritime University - Kolkata Campus',
    type: 'GFTI',
    state: 'West Bengal'
  },
  141: {
    name: 'Netaji Subhas University of Technology, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  142: {
    name: 'Indira Gandhi Delhi Technical University for Women, New Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  143: {
    name: 'Manipal Institute of Technology, Manipal',
    type: 'GFTI',
    state: 'Karnataka'
  },
  144: {
    name: 'Gautam Buddha University, Greater Noida',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  145: {
    name: 'Indian Maritime University - Visakhapatnam Campus',
    type: 'GFTI',
    state: 'Andhra Pradesh'
  },
};
