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
  49: {
    name: 'Birla Institute of Technology, Mesra,  Ranchi',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  156: {
    name: 'Gurukula Kangri Vishwavidyalaya, Haridwar',
    type: 'GFTI',
    state: 'Uttarakhand'
  },
  191: {
    name: 'Indian Institute of Carpet Technology,  Bhadohi',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  200: {
    name: 'Institute of Infrastructure, Technology, Research and Management-Ahmedabad',
    type: 'GFTI',
    state: 'Gujarat'
  },
  226: {
    name: 'School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  291: {
    name: 'J.K. Institute of Applied Physics & Technology, Department of Electronics & Communication, University of Allahabad- Allahabad',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  305: {
    name: 'National Institute of Electronics and Information Technology, Aurangabad (Maharashtra)',
    type: 'GFTI',
    state: 'Maharashtra'
  },
  319: {
    name: 'National Institute of Advanced Manufacturing Technology, Ranchi',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  366: {
    name: 'Sant Longowal Institute of Engineering and Technology',
    type: 'GFTI',
    state: 'Punjab'
  },
  459: {
    name: 'Mizoram University, Aizawl',
    type: 'GFTI',
    state: 'Mizoram'
  },
  488: {
    name: 'School of Engineering, Tezpur University, Napaam, Tezpur',
    type: 'GFTI',
    state: 'Assam'
  },
  546: {
    name: 'School of Planning & Architecture, Bhopal',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  559: {
    name: 'School of Planning & Architecture, New Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  574: {
    name: 'School of Planning & Architecture: Vijayawada',
    type: 'GFTI',
    state: 'Andhra Pradesh'
  },
  587: {
    name: 'Shri Mata Vaishno Devi University, Katra, Jammu & Kashmir',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  650: {
    name: 'International Institute of Information Technology, Naya Raipur',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  682: {
    name: 'University of Hyderabad',
    type: 'GFTI',
    state: 'Telangana'
  },
  698: {
    name: 'Punjab Engineering College, Chandigarh',
    type: 'GFTI',
    state: 'Chandigarh'
  },
  820: {
    name: 'Jawaharlal Nehru University, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  836: {
    name: 'International Institute of Information Technology, Bhubaneswar',
    type: 'GFTI',
    state: 'Odisha'
  },
  862: {
    name: 'Central institute of Technology Kokrajar, Assam',
    type: 'GFTI',
    state: 'Assam'
  },
  882: {
    name: 'Puducherry Technological University, Puducherry',
    type: 'GFTI',
    state: 'Puducherry'
  },
  940: {
    name: 'Ghani Khan Choudhary Institute of Engineering and Technology, Malda, West Bengal',
    type: 'GFTI',
    state: 'West Bengal'
  },
  1001: {
    name: 'Central University of Rajasthan, Rajasthan',
    type: 'GFTI',
    state: 'Rajasthan'
  },
  1019: {
    name: 'National Institute of Food Technology Entrepreneurship and Management, Kundli',
    type: 'GFTI',
    state: 'Haryana'
  },
  1027: {
    name: 'National Institute of Food Technology Entrepreneurship and Management, Thanjavur',
    type: 'GFTI',
    state: 'Tamil Nadu'
  },
  1034: {
    name: 'North Eastern Regional Institute of Science and Technology, Nirjuli-791109 (Itanagar),Arunachal Pradesh',
    type: 'GFTI',
    state: 'Arunachal Pradesh'
  },
  1047: {
    name: 'Indian Institute of Handloom Technology(IIHT), Varanasi',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  1054: {
    name: 'Chhattisgarh Swami Vivekanada Technical University, Bhilai (CSVTU Bhilai)',
    type: 'GFTI',
    state: 'Chhattisgarh'
  },
  1080: {
    name: 'Institute of Chemical Technology, Mumbai: Indian Oil Odisha Campus, Bhubaneswar',
    type: 'GFTI',
    state: 'Odisha'
  },
  1092: {
    name: 'North-Eastern Hill University, Shillong',
    type: 'GFTI',
    state: 'Meghalaya'
  },
  1115: {
    name: 'Central University of Jammu',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  1149: {
    name: 'Institute of Engineering and Technology, Dr. H. S. Gour University. Sagar (A Central University)',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  1179: {
    name: 'Central University of Haryana',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  1203: {
    name: 'Birla Institute of Technology, Deoghar Off-Campus',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  1282: {
    name: 'Birla Institute of Technology, Patna Off-Campus',
    type: 'GFTI',
    state: 'Bihar'
  },
  1371: {
    name: 'Indian Institute of Handloom Technology, Salem',
    type: 'GFTI',
    state: 'Tamil Nadu'
  },
  1378: {
    name: 'Gati Shakti Vishwavidyalaya, Vadodara',
    type: 'GFTI',
    state: 'Gujarat'
  },
  1441: {
    name: 'CU Jharkhand',
    type: 'GFTI',
    state: 'Jharkhand'
  },
  1461: {
    name: 'National Institute of Electronics and Information Technology, Ropar (Punjab)',
    type: 'GFTI',
    state: 'Punjab'
  },
  1476: {
    name: 'National Institute of Electronics and Information Technology, Patna (Bihar)',
    type: 'GFTI',
    state: 'Bihar'
  },
  1484: {
    name: 'National Institute of Electronics and Information Technology, Ajmer (Rajasthan)',
    type: 'GFTI',
    state: 'Rajasthan'
  },
  1491: {
    name: 'National Institute of Electronics and Information Technology, Gorakhpur (UP)',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  1505: {
    name: 'Rajiv Gandhi National Aviation University, Fursatganj, Amethi (UP)',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  1526: {
    name: 'Islamic University of Science and Technology Kashmir',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  1542: {
    name: 'Shri G. S. Institute of Technology and Science Indore',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  1551: {
    name: 'National Institute of Technical Teachers Training and Research Bhopal',
    type: 'GFTI',
    state: 'Madhya Pradesh'
  },
  1625: {
    name: 'Central University of Karnataka',
    type: 'GFTI',
    state: 'Karnataka'
  },
  1649: {
    name: 'National Institute of Electronics and Information Technology, Agartala',
    type: 'GFTI',
    state: 'Tripura'
  },
  1656: {
    name: 'National Institute of Electronics and Information Technology, Aizawl',
    type: 'GFTI',
    state: 'Mizoram'
  },
  1668: {
    name: 'National Institute of Electronics and Information Technology, Imphal',
    type: 'GFTI',
    state: 'Manipur'
  },
  1674: {
    name: 'National Institute of Electronics and Information Technology, Calicut',
    type: 'GFTI',
    state: 'Kerala'
  },
  1680: {
    name: 'National Institute of Electronics and Information Technology, Kohima',
    type: 'GFTI',
    state: 'Nagaland'
  },
  1686: {
    name: 'National Institute of Electronics and Information Technology, Srinagar',
    type: 'GFTI',
    state: 'Jammu & Kashmir'
  },
  1694: {
    name: 'Central University of Punjab, Bathinda',
    type: 'GFTI',
    state: 'Punjab'
  },
  1706: {
    name: 'Indian Institute  of Technology Bhubaneswar',
    type: 'IIT',
    state: 'Odisha'
  },
  1785: {
    name: 'Indian Institute  of Technology Bombay',
    type: 'IIT',
    state: 'Maharashtra'
  },
  1971: {
    name: 'Indian Institute  of Technology Mandi',
    type: 'IIT',
    state: 'Himachal Pradesh'
  },
  2115: {
    name: 'Indian Institute  of Technology Delhi',
    type: 'IIT',
    state: 'Delhi'
  },
  2357: {
    name: 'Indian Institute  of Technology Indore',
    type: 'IIT',
    state: 'Madhya Pradesh'
  },
  2476: {
    name: 'Indian Institute  of Technology Kharagpur',
    type: 'IIT',
    state: 'West Bengal'
  },
  2735: {
    name: 'Indian Institute  of Technology Hyderabad',
    type: 'IIT',
    state: 'Telangana'
  },
  2890: {
    name: 'Indian Institute  of Technology Jodhpur',
    type: 'IIT',
    state: 'Rajasthan'
  },
  3012: {
    name: 'Indian Institute  of Technology Kanpur',
    type: 'IIT',
    state: 'Uttar Pradesh'
  },
  3179: {
    name: 'Indian Institute  of Technology Madras',
    type: 'IIT',
    state: 'Tamil Nadu'
  },
  3374: {
    name: 'Indian Institute  of Technology Gandhinagar',
    type: 'IIT',
    state: 'Gujarat'
  },
  3456: {
    name: 'Indian Institute  of Technology Patna',
    type: 'IIT',
    state: 'Bihar'
  },
  3695: {
    name: 'Indian Institute  of Technology Roorkee',
    type: 'IIT',
    state: 'Uttarakhand'
  },
  3891: {
    name: 'Indian Institute  of Technology (ISM) Dhanbad',
    type: 'IIT',
    state: 'Jharkhand'
  },
  4070: {
    name: 'Indian Institute  of Technology Ropar',
    type: 'IIT',
    state: 'Punjab'
  },
  4190: {
    name: 'Indian Institute  of Technology (BHU) Varanasi',
    type: 'IIT',
    state: 'Uttar Pradesh'
  },
  4362: {
    name: 'Indian Institute  of Technology Guwahati',
    type: 'IIT',
    state: 'Assam'
  },
  4494: {
    name: 'Indian Institute of Technology Bhilai',
    type: 'IIT',
    state: 'Chhattisgarh'
  },
  4563: {
    name: 'Indian Institute of Technology Goa',
    type: 'IIT',
    state: 'Goa'
  },
  4601: {
    name: 'Indian Institute  of Technology Palakkad',
    type: 'IIT',
    state: 'Kerala'
  },
  4660: {
    name: 'Indian Institute  of Technology Tirupati',
    type: 'IIT',
    state: 'Arunachal Pradesh'
  },
  4715: {
    name: 'Indian Institute of Technology Jammu',
    type: 'IIT',
    state: 'Jammu & Kashmir'
  },
  4803: {
    name: 'Indian Institute of Technology Dharwad',
    type: 'IIT',
    state: 'Karnataka'
  },
  4895: {
    name: 'Indian Institute of Science, Bangalore',
    type: 'IIT',
    state: 'Karnataka'
  },
  4934: {
    name: 'Atal Bihari Vajpayee Indian Institute of Information Technology & Management Gwalior',
    type: 'IIIT',
    state: 'Bihar'
  },
  5000: {
    name: 'Indian Institute of Information Technology (IIIT)Kota, Rajasthan',
    type: 'IIIT',
    state: 'Rajasthan'
  },
  5039: {
    name: 'Indian Institute of Information Technology Guwahati',
    type: 'IIIT',
    state: 'Assam'
  },
  5078: {
    name: 'Indian Institute of Information Technology(IIIT) Kalyani, West Bengal',
    type: 'IIIT',
    state: 'West Bengal'
  },
  5116: {
    name: 'Indian Institute of Information Technology(IIIT) Kilohrad, Sonepat, Haryana',
    type: 'IIIT',
    state: 'Haryana'
  },
  5145: {
    name: 'Indian Institute of Information Technology(IIIT) Una, Himachal Pradesh',
    type: 'IIIT',
    state: 'Himachal Pradesh'
  },
  5179: {
    name: 'Indian Institute of Information Technology (IIIT), Sri City, Chittoor',
    type: 'IIIT',
    state: 'Andhra Pradesh'
  },
  5220: {
    name: 'Indian Institute of Information Technology(IIIT), Vadodara, Gujrat',
    type: 'IIIT',
    state: 'Gujarat'
  },
  5311: {
    name: 'Indian Institute of Information Technology, Allahabad',
    type: 'IIIT',
    state: 'Uttar Pradesh'
  },
  5378: {
    name: 'Indian Institute of Information Technology, Design & Manufacturing, Kancheepuram',
    type: 'IIIT',
    state: 'Tamil Nadu'
  },
  5510: {
    name: 'Pt. Dwarka Prasad Mishra Indian Institute of Information Technology, Design & Manufacture Jabalpur',
    type: 'IIIT',
    state: 'Madhya Pradesh'
  },
  5566: {
    name: 'INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR',
    type: 'IIIT',
    state: 'Manipur'
  },
  5596: {
    name: 'Indian Institute of Information Technology Tiruchirappalli',
    type: 'IIIT',
    state: 'Tamil Nadu'
  },
  5649: {
    name: 'Indian Institute of Information Technology Lucknow',
    type: 'IIIT',
    state: 'Uttar Pradesh'
  },
  5699: {
    name: 'Indian Institute of Information Technology(IIIT) Dharwad',
    type: 'IIIT',
    state: 'Karnataka'
  },
  5751: {
    name: 'Indian Institute of Information Technology Design & Manufacturing Kurnool, Andhra Pradesh',
    type: 'IIIT',
    state: 'Andhra Pradesh'
  },
  5835: {
    name: 'Indian Institute of Information Technology(IIIT) Kottayam',
    type: 'IIIT',
    state: 'Kerala'
  },
  5898: {
    name: 'Indian Institute of Information Technology (IIIT) Ranchi',
    type: 'IIIT',
    state: 'Jharkhand'
  },
  5932: {
    name: 'Indian Institute of Information Technology (IIIT) Nagpur',
    type: 'IIIT',
    state: 'Maharashtra'
  },
  5982: {
    name: 'Indian Institute of Information Technology (IIIT) Pune',
    type: 'IIIT',
    state: 'Maharashtra'
  },
  6049: {
    name: 'Indian Institute of Information Technology Bhagalpur',
    type: 'IIIT',
    state: 'Bihar'
  },
  6100: {
    name: 'Indian Institute of Information Technology Bhopal',
    type: 'IIIT',
    state: 'Madhya Pradesh'
  },
  6171: {
    name: 'Indian Institute of Information Technology Surat',
    type: 'IIIT',
    state: 'Gujarat'
  },
  6231: {
    name: 'Indian Institute of Information Technology, Agartala',
    type: 'IIIT',
    state: 'Tripura'
  },
  6244: {
    name: 'Indian institute of information technology, Raichur, Karnataka',
    type: 'IIIT',
    state: 'Karnataka'
  },
  6283: {
    name: 'Indian Institute of Information Technology, Vadodara International Campus Diu (IIITVICD)',
    type: 'IIIT',
    state: 'Gujarat'
  },
  6332: {
    name: 'Dr. B R Ambedkar National Institute of Technology, Jalandhar',
    type: 'NIT',
    state: 'Punjab'
  },
  6648: {
    name: 'Malaviya National Institute of Technology Jaipur',
    type: 'NIT',
    state: 'Rajasthan'
  },
  6896: {
    name: 'Maulana Azad National Institute of Technology Bhopal',
    type: 'NIT',
    state: 'Madhya Pradesh'
  },
  7184: {
    name: 'Motilal Nehru National Institute of Technology Allahabad',
    type: 'NIT',
    state: 'Uttar Pradesh'
  },
  7415: {
    name: 'National Institute of Technology  Agartala',
    type: 'NIT',
    state: 'Tripura'
  },
  7647: {
    name: 'National Institute of Technology Calicut',
    type: 'NIT',
    state: 'Kerala'
  },
  7947: {
    name: 'National Institute of Technology Delhi',
    type: 'NIT',
    state: 'Delhi'
  },
  8088: {
    name: 'National Institute of Technology Durgapur',
    type: 'NIT',
    state: 'West Bengal'
  },
  8322: {
    name: 'National Institute of Technology Goa',
    type: 'NIT',
    state: 'Goa'
  },
  8426: {
    name: 'National Institute of Technology Hamirpur',
    type: 'NIT',
    state: 'Himachal Pradesh'
  },
  8677: {
    name: 'National Institute of Technology Karnataka, Surathkal',
    type: 'NIT',
    state: 'Karnataka'
  },
  8929: {
    name: 'National Institute of Technology Meghalaya',
    type: 'NIT',
    state: 'Meghalaya'
  },
  8989: {
    name: 'National Institute of Technology Nagaland',
    type: 'NIT',
    state: 'Nagaland'
  },
  9047: {
    name: 'National Institute of Technology Patna',
    type: 'NIT',
    state: 'Bihar'
  },
  9380: {
    name: 'National Institute of Technology Puducherry',
    type: 'NIT',
    state: 'Puducherry'
  },
  9472: {
    name: 'National Institute of Technology Raipur',
    type: 'NIT',
    state: 'Chhattisgarh'
  },
  9737: {
    name: 'National Institute of Technology Sikkim',
    type: 'NIT',
    state: 'Sikkim'
  },
  9821: {
    name: 'National Institute of Technology Arunachal Pradesh',
    type: 'NIT',
    state: 'Arunachal Pradesh'
  },
  9901: {
    name: 'National Institute of Technology, Jamshedpur',
    type: 'NIT',
    state: 'Jharkhand'
  },
  10080: {
    name: 'National Institute of Technology, Kurukshetra',
    type: 'NIT',
    state: 'Haryana'
  },
  10440: {
    name: 'National Institute of Technology, Manipur',
    type: 'NIT',
    state: 'Manipur'
  },
  10550: {
    name: 'National Institute of Technology, Mizoram',
    type: 'NIT',
    state: 'Mizoram'
  },
  10627: {
    name: 'National Institute of Technology, Rourkela',
    type: 'NIT',
    state: 'Odisha'
  },
  11033: {
    name: 'National Institute of Technology, Silchar',
    type: 'NIT',
    state: 'Assam'
  },
  11179: {
    name: 'National Institute of Technology, Srinagar',
    type: 'NIT',
    state: 'Jammu & Kashmir'
  },
  11373: {
    name: 'National Institute of Technology, Tiruchirappalli',
    type: 'NIT',
    state: 'Tamil Nadu'
  },
  11617: {
    name: 'National Institute of Technology, Uttarakhand',
    type: 'NIT',
    state: 'Uttarakhand'
  },
  11706: {
    name: 'National Institute of Technology, Warangal',
    type: 'NIT',
    state: 'Telangana'
  },
  12045: {
    name: 'Sardar Vallabhbhai National Institute of Technology, Surat',
    type: 'NIT',
    state: 'Gujarat'
  },
  12348: {
    name: 'Visvesvaraya National Institute of Technology, Nagpur',
    type: 'NIT',
    state: 'Maharashtra'
  },
  12654: {
    name: 'National Institute of Technology, Andhra Pradesh',
    type: 'NIT',
    state: 'Andhra Pradesh'
  },
  12820: {
    name: 'Indian Institute of Engineering Science and Technology, Shibpur',
    type: 'NIT',
    state: 'West Bengal'
  },
  193145: {
    name: 'Delhi Technological University, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  193167: {
    name: 'Indian Maritime University - Kolkata Campus',
    type: 'GFTI',
    state: 'West Bengal'
  },
  193168: {
    name: 'Netaji Subhas University of Technology, Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  193175: {
    name: 'Indira Gandhi Delhi Technical University for Women, New Delhi',
    type: 'GFTI',
    state: 'Delhi'
  },
  193183: {
    name: 'Manipal Institute of Technology, Manipal',
    type: 'GFTI',
    state: 'Karnataka'
  },
  205244: {
    name: 'Gautam Buddha University, Greater Noida',
    type: 'GFTI',
    state: 'Uttar Pradesh'
  },
  205245: {
    name: 'Indian Maritime University - Visakhapatnam Campus',
    type: 'GFTI',
    state: 'Bihar'
  },
};
