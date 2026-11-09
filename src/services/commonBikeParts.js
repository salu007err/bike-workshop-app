/**
 * Comprehensive global catalog of commonly available Motorcycle and Scooter spare parts.
 * Stored entirely on the frontend with English & Malayalam search keywords.
 */

export const COMMON_BIKE_PARTS = [
  // --- 1. ENGINE & OIL & LUBRICANTS ---
  { name: 'Engine Oil 4T 20W40 (1L)', category: 'Engine & Fluids', ml: 'എൻജിൻ ഓയിൽ 20W40' },
  { name: 'Engine Oil 4T 10W30 (1L)', category: 'Engine & Fluids', ml: 'എൻജിൻ ഓയിൽ 10W30' },
  { name: 'Engine Oil 4T 15W50 (1L)', category: 'Engine & Fluids', ml: 'എൻജിൻ ഓയിൽ 15W50' },
  { name: 'Engine Oil 4T 10W40 (1L)', category: 'Engine & Fluids', ml: 'എൻജിൻ ഓയിൽ 10W40' },
  { name: 'Engine Oil 4T 20W50 (1L)', category: 'Engine & Fluids', ml: 'എൻജിൻ ഓയിൽ 20W50' },
  { name: 'Fully Synthetic 4T Engine Oil', category: 'Engine & Fluids', ml: 'സിന്തറ്റിക് എൻജിൻ ഓയിൽ' },
  { name: 'Semi-Synthetic 4T Engine Oil', category: 'Engine & Fluids', ml: 'സെമി സിന്തറ്റിക് ഓയിൽ' },
  { name: 'Scooter Gear Oil 80W90 (120ml)', category: 'Engine & Fluids', ml: 'സ്കൂട്ടർ ഗിയർ ഓയിൽ' },
  { name: 'Fork Oil 10W / 15W / 20W', category: 'Engine & Fluids', ml: 'ഷോക്ക് അബ്സോർബർ ഫോർക്ക് ഓയിൽ' },
  { name: 'Radiator Coolant Fluid', category: 'Engine & Fluids', ml: 'കൂളന്റ്' },
  { name: 'Chain Lube Spray (150ml / 500ml)', category: 'Engine & Fluids', ml: 'ചെയിൻ ലൂബ് സ്പ്രേ' },
  { name: 'Chain Cleaner Spray', category: 'Engine & Fluids', ml: 'ചെയിൻ ക്ലീനർ സ്പ്രേ' },
  { name: 'Brake Fluid DOT 3 / DOT 4', category: 'Engine & Fluids', ml: 'ബ്രേക്ക് ഓയിൽ' },

  // --- 2. FILTERS ---
  { name: 'Oil Filter Element', category: 'Filters', ml: 'ഓയിൽ ഫിൽറ്റർ' },
  { name: 'Air Filter Element (Paper)', category: 'Filters', ml: 'എയർ ഫിൽറ്റർ' },
  { name: 'Foam Air Filter Sponge', category: 'Filters', ml: 'എയർ ഫിൽറ്റർ സ്പോഞ്ച്' },
  { name: 'Petrol / Fuel Filter', category: 'Filters', ml: 'പെട്രോൾ ഫിൽറ്റർ' },

  // --- 3. BRAKING SYSTEM ---
  { name: 'Brake Shoe (Rear Drum)', category: 'Brakes', ml: 'ബ്രേക്ക് ഷൂ ബാക്ക്' },
  { name: 'Brake Shoe (Front Drum)', category: 'Brakes', ml: 'ബ്രേക്ക് ഷൂ ഫ്രണ്ട്' },
  { name: 'Disc Brake Pad (Front)', category: 'Brakes', ml: 'ഡിസ്ക് ബ്രേക്ക് പാഡ് ഫ്രണ്ട്' },
  { name: 'Disc Brake Pad (Rear)', category: 'Brakes', ml: 'ഡിസ്ക് ബ്രേക്ക് പാഡ് ബാക്ക്' },
  { name: 'Brake Disc Rotor Plate (Front)', category: 'Brakes', ml: 'ബ്രേക്ക് ഡിസ്ക് പ്ലേറ്റ് ഫ്രണ്ട്' },
  { name: 'Brake Disc Rotor Plate (Rear)', category: 'Brakes', ml: 'ബ്രേക്ക് ഡിസ്ക് പ്ലേറ്റ് ബാക്ക്' },
  { name: 'Brake Master Cylinder Assembly', category: 'Brakes', ml: 'ബ്രേക്ക് മാസ്റ്റർ സിലിണ്ടർ' },
  { name: 'Brake Master Cylinder Minor Kit', category: 'Brakes', ml: 'മാസ്റ്റർ സിലിണ്ടർ മൈനർ കിറ്റ്' },
  { name: 'Brake Master Cylinder Major Kit', category: 'Brakes', ml: 'മാസ്റ്റർ സിലിണ്ടർ മേജർ കിറ്റ്' },
  { name: 'Brake Caliper Assembly', category: 'Brakes', ml: 'ബ്രേക്ക് കാലിപ്പർ' },
  { name: 'Brake Caliper Piston & Seal Kit', category: 'Brakes', ml: 'കാലിപ്പർ പിസ്റ്റൺ സീൽ' },
  { name: 'Brake Hose Pipe / Hydraulic Hose', category: 'Brakes', ml: 'ബ്രേക്ക് ഹോസ് പൈപ്പ്' },
  { name: 'Front Brake Lever', category: 'Brakes', ml: 'ഫ്രണ്ട് ബ്രേക്ക് ലിവർ' },
  { name: 'Rear Brake Lever (Scooter)', category: 'Brakes', ml: 'ബാക്ക് ബ്രേക്ക് ലിവർ' },
  { name: 'Rear Brake Pedal (Motorcycle)', category: 'Brakes', ml: 'ബ്രേക്ക് പെഡൽ' },
  { name: 'Rear Brake Rod & Spring Kit', category: 'Brakes', ml: 'ബ്രേക്ക് റോഡ് സ്പ്രിങ്' },
  { name: 'Drum Brake Cam & Lever', category: 'Brakes', ml: 'ബ്രേക്ക് കാം' },
  { name: 'Brake Shoe Spring Kit', category: 'Brakes', ml: 'ബ്രേക്ക് ഷൂ സ്പ്രിങ്' },

  // --- 4. CLUTCH & TRANSMISSION ---
  { name: 'Clutch Friction Plate Set', category: 'Clutch & Gear', ml: 'ക്ലച്ച് പ്ലേറ്റ് സെറ്റ്' },
  { name: 'Clutch Steel Plate Set', category: 'Clutch & Gear', ml: 'ക്ലച്ച് സ്റ്റീൽ പ്ലേറ്റ്' },
  { name: 'Clutch Center Hub', category: 'Clutch & Gear', ml: 'ക്ലച്ച് സെന്റർ ഹബ്ബ്' },
  { name: 'Clutch Pressure Plate', category: 'Clutch & Gear', ml: 'ക്ലച്ച് പ്രഷർ പ്ലേറ്റ്' },
  { name: 'Clutch Housing / Bell Outer', category: 'Clutch & Gear', ml: 'ക്ലച്ച് ഹൗസിംഗ്' },
  { name: 'Clutch Release Bearing', category: 'Clutch & Gear', ml: 'ക്ലച്ച് ബെയറിംഗ്' },
  { name: 'Clutch Springs Set', category: 'Clutch & Gear', ml: 'ക്ലച്ച് സ്പ്രിങ്' },
  { name: 'Gear Shift Lever', category: 'Clutch & Gear', ml: 'ഗിയർ ലിവർ' },
  { name: 'Gear Shift Shaft with Pawl', category: 'Clutch & Gear', ml: 'ഗിയർ ഷാഫ്റ്റ്' },
  { name: 'Clutch Cable', category: 'Clutch & Gear', ml: 'ക്ലച്ച് കേബിൾ' },

  // --- 5. SCOOTER CVT & VARIATOR SYSTEM ---
  { name: 'Scooter CVT Drive Belt / V-Belt (Activa/Access/Jupiter)', category: 'Scooter CVT', ml: 'സ്കൂട്ടർ ബെൽറ്റ് V-Belt' },
  { name: 'Variator Roller Weights Set (6 pcs)', category: 'Scooter CVT', ml: 'റോളർ വെയിറ്റ് സെറ്റ്' },
  { name: 'Variator Fan & Face Pulley', category: 'Scooter CVT', ml: 'വേരിയേറ്റർ പുള്ളി' },
  { name: 'Variator Ramp Plate Slider Clips', category: 'Scooter CVT', ml: 'സ്ലൈഡർ ക്ലിപ്പ്' },
  { name: 'Scooter Centrifugal Clutch Shoe Assembly', category: 'Scooter CVT', ml: 'സ്കൂട്ടർ ക്ലച്ച് ഷൂ' },
  { name: 'Scooter Clutch Outer Bell', category: 'Scooter CVT', ml: 'സ്കൂട്ടർ ക്ലച്ച് ബെൽ' },
  { name: 'Scooter Torque Spring', category: 'Scooter CVT', ml: 'ടോർക്ക് സ്പ്രിങ്' },
  { name: 'Kick Starter Pinion Gear', category: 'Scooter CVT', ml: 'കിക്ക് പിനിയൻ ഗിയർ' },
  { name: 'Kick Starter Spindle & Spring', category: 'Scooter CVT', ml: 'കിക്ക് സ്പ്രിങ്' },

  // --- 6. ELECTRICAL, IGNITION & LIGHTING ---
  { name: 'Spark Plug (Standard NGK / Bosch)', category: 'Electrical', ml: 'സ്പാർക്ക് പ്ലഗ്' },
  { name: 'Spark Plug (Iridium High Performance)', category: 'Electrical', ml: 'ഇറിഡിയം സ്പാർക്ക് പ്ലഗ്' },
  { name: 'Spark Plug Cap (Resistor Cap)', category: 'Electrical', ml: 'പ്ലഗ് ക്യാപ്' },
  { name: 'Ignition Coil / HT Coil', category: 'Electrical', ml: 'ഇഗ്നിഷൻ കോയിൽ' },
  { name: 'CDI Unit / TCI Igniter', category: 'Electrical', ml: 'സിഡിഐ യൂണിറ്റ് CDI' },
  { name: 'Stator Coil / Magneto Plate', category: 'Electrical', ml: 'സ്റ്റേറ്റർ കോയിൽ മാഗ്നെറ്റോ' },
  { name: 'Rectifier Regulator (RR Unit)', category: 'Electrical', ml: 'റഗുലേറ്റർ റെക്റ്റിഫയർ RR' },
  { name: 'Starter Motor / Self Motor Assembly', category: 'Electrical', ml: 'സ്റ്റാർട്ടർ മോട്ടോർ സെൽഫ്' },
  { name: 'Starter Relay / Solenoid Switch', category: 'Electrical', ml: 'സെൽഫ് റിലേ' },
  { name: 'Starter Motor Carbon Brush Kit', category: 'Electrical', ml: 'കാർബൺ ബ്രഷ്' },
  { name: 'Starter One-Way Clutch / Bendix Gear', category: 'Electrical', ml: 'വൺ വേ ക്ലച്ച് ബെൻഡിക്സ്' },
  { name: 'Battery 12V 4Ah (Maintenance Free)', category: 'Electrical', ml: 'ബാറ്ററി 4Ah' },
  { name: 'Battery 12V 5Ah', category: 'Electrical', ml: 'ബാറ്ററി 5Ah' },
  { name: 'Battery 12V 2.5Ah', category: 'Electrical', ml: 'ബാറ്ററി 2.5Ah' },
  { name: 'Battery 12V 7Ah / 9Ah', category: 'Electrical', ml: 'ബാറ്ററി 7Ah 9Ah' },
  { name: 'Headlight Bulb (HS1 35/35W Halogen)', category: 'Electrical', ml: 'ഹെഡ്‌ലൈറ്റ് ബൾബ്' },
  { name: 'Headlight Bulb (H4 55/60W)', category: 'Electrical', ml: 'H4 ഹെഡ്‌ലൈറ്റ് ബൾബ്' },
  { name: 'LED Headlight Bulb (High Beam/Low Beam)', category: 'Electrical', ml: 'LED ഹെഡ്‌ലൈറ്റ്' },
  { name: 'Tail Light Bulb / Stop Light Bulb (12V 21/5W)', category: 'Electrical', ml: 'ടെയിൽ ലൈറ്റ് ബൾബ്' },
  { name: 'Indicator Bulb 12V 10W (Amber/Clear)', category: 'Electrical', ml: 'ഇൻഡിക്കേറ്റർ ബൾബ്' },
  { name: 'Turn Signal Indicator Assembly (Front L/R)', category: 'Electrical', ml: 'ഇൻഡിക്കേറ്റർ സെറ്റ് ഫ്രണ്ട്' },
  { name: 'Turn Signal Indicator Assembly (Rear L/R)', category: 'Electrical', ml: 'ഇൻഡിക്കേറ്റർ സെറ്റ് ബാക്ക്' },
  { name: 'Turn Signal Flasher Relay', category: 'Electrical', ml: 'ഫ്ലാഷർ റിലേ' },
  { name: 'Horn 12V (Standard / High Pitch)', category: 'Electrical', ml: 'ഹോൺ' },
  { name: 'Ignition Key Lock Switch Set (with Tank Cap)', category: 'Electrical', ml: 'കീ ലോക്ക് സെറ്റ്' },
  { name: 'Handlebar Switch Assembly (Left - Horn/Beam/Turn)', category: 'Electrical', ml: 'ഹാൻഡിൽ സ്വിച്ച് ഇടത്' },
  { name: 'Handlebar Switch Assembly (Right - Self/Light)', category: 'Electrical', ml: 'ഹാൻഡിൽ സ്വിച്ച് വലത്' },
  { name: 'Neutral Switch / Gear Indicator Sensor', category: 'Electrical', ml: 'ന്യൂട്രൽ സ്വിച്ച്' },
  { name: 'Brake Light Switch (Front / Rear)', category: 'Electrical', ml: 'ബ്രേക്ക് ലൈറ്റ് സ്വിച്ച്' },
  { name: 'Main Wiring Harness Loom', category: 'Electrical', ml: 'വയറിങ് കിറ്റ്' },

  // --- 7. DRIVE CHAIN, SPROCKETS & WHEELS ---
  { name: 'Drive Chain & Sprocket Kit (Brass/Roller)', category: 'Drive & Wheels', ml: 'ചെയിൻ സ്പ്രോക്കറ്റ് കിറ്റ്' },
  { name: 'Drive Chain 428H / 520 (Heavy Duty)', category: 'Drive & Wheels', ml: 'ഡ്രൈവ് ചെയിൻ' },
  { name: 'Front Countershaft Sprocket', category: 'Drive & Wheels', ml: 'ഫ്രണ്ട് സ്പ്രോക്കറ്റ്' },
  { name: 'Rear Wheel Driven Sprocket', category: 'Drive & Wheels', ml: 'ബാക്ക് സ്പ്രോക്കറ്റ്' },
  { name: 'Chain Lock / Master Link (428 / 520)', category: 'Drive & Wheels', ml: 'ചെയിൻ ലോക്ക്' },
  { name: 'Chain Adjuster Tensioner Bolts', category: 'Drive & Wheels', ml: 'ചെയിൻ അഡ്ജസ്റ്റർ' },
  { name: 'Chain Cover / Guard', category: 'Drive & Wheels', ml: 'ചെയിൻ കവർ' },
  { name: 'Wheel Bearing 6201 2RS', category: 'Drive & Wheels', ml: 'വീൽ ബെയറിംഗ് 6201' },
  { name: 'Wheel Bearing 6202 2RS', category: 'Drive & Wheels', ml: 'വീൽ ബെയറിംഗ് 6202' },
  { name: 'Wheel Bearing 6203 2RS', category: 'Drive & Wheels', ml: 'വീൽ ബെയറിംഗ് 6203' },
  { name: 'Wheel Bearing 6301 2RS', category: 'Drive & Wheels', ml: 'വീൽ ബെയറിംഗ് 6301' },
  { name: 'Wheel Bearing 6302 2RS', category: 'Drive & Wheels', ml: 'വീൽ ബെയറിംഗ് 6302' },
  { name: 'Front Wheel Axle with Nut', category: 'Drive & Wheels', ml: 'ഫ്രണ്ട് വീൽ ആക്സിൽ' },
  { name: 'Rear Wheel Axle with Nut', category: 'Drive & Wheels', ml: 'ബാക്ക് വീൽ ആക്സിൽ' },
  { name: 'Wheel Hub Rubber Cushion Damper Set', category: 'Drive & Wheels', ml: 'ഹബ്ബ് റബ്ബർ കുഷ്യൻ' },
  { name: 'Tubeless Tyre Air Valve Pin', category: 'Drive & Wheels', ml: 'ട്യൂബ്‌ലെസ്സ് വാൽവ് പിൻ' },
  { name: 'Tyre Tube (Front / Rear)', category: 'Drive & Wheels', ml: 'ടയർ ട്യൂബ്' },

  // --- 8. SUSPENSION & STEERING ---
  { name: 'Front Fork Oil Seal (Pair)', category: 'Suspension', ml: 'ഫോർക്ക് ഓയിൽ സീൽ' },
  { name: 'Front Fork Dust Cap Seal (Pair)', category: 'Suspension', ml: 'ഡസ്റ്റ് സീൽ' },
  { name: 'Front Fork Inner Pipe / Stanchion Tube', category: 'Suspension', ml: 'ഫോർക്ക് പൈപ്പ്' },
  { name: 'Front Fork Spring (Pair)', category: 'Suspension', ml: 'ഫോർക്ക് സ്പ്രിങ്' },
  { name: 'Rear Shock Absorber (Pair)', category: 'Suspension', ml: 'ബാക്ക് ഷോക്ക് അബ്സോർബർ' },
  { name: 'Monoshock Absorber (Rear)', category: 'Suspension', ml: 'മോണോഷോക്ക്' },
  { name: 'Steering Handle Cone Set / Racer Bearings', category: 'Suspension', ml: 'കോൺ സെറ്റ് റേസർ' },
  { name: 'Swingarm Bush Kit', category: 'Suspension', ml: 'സ്വിങ് ആം ബുഷ്' },
  { name: 'Main / Center Stand Pin & Bush', category: 'Suspension', ml: 'സെന്റർ സ്റ്റാൻഡ് പിൻ' },
  { name: 'Center Stand Assembly', category: 'Suspension', ml: 'സെന്റർ സ്റ്റാൻഡ്' },
  { name: 'Side Stand with Spring', category: 'Suspension', ml: 'സൈഡ് സ്റ്റാൻഡ്' },

  // --- 9. CABLES & CONTROLS ---
  { name: 'Accelerator / Throttle Cable', category: 'Cables & Controls', ml: 'ആക്സിലറേറ്റർ കേബിൾ' },
  { name: 'Clutch Cable Assembly', category: 'Cables & Controls', ml: 'ക്ലച്ച് കേബിൾ' },
  { name: 'Front Brake Cable (Drum)', category: 'Cables & Controls', ml: 'ഫ്രണ്ട് ബ്രേക്ക് കേബിൾ' },
  { name: 'Rear Brake Cable (Scooter)', category: 'Cables & Controls', ml: 'ബാക്ക് ബ്രേക്ക് കേബിൾ' },
  { name: 'Speedometer Cable', category: 'Cables & Controls', ml: 'മീറ്റർ കേബിൾ' },
  { name: 'Speedometer Gear Drive / Worm Gear', category: 'Cables & Controls', ml: 'മീറ്റർ ഗിയർ' },
  { name: 'Choke Cable', category: 'Cables & Controls', ml: 'ചോക്ക് കേബിൾ' },
  { name: 'Handlebar Grip Rubber Set (L+R)', category: 'Cables & Controls', ml: 'ഹാൻഡിൽ ഗ്രിപ്പ് റബ്ബർ' },
  { name: 'Throttle Tube / Twist Grip Pipe', category: 'Cables & Controls', ml: 'ആക്സിലറേറ്റർ പൈപ്പ്' },
  { name: 'Handlebar (Black / Chrome)', category: 'Cables & Controls', ml: 'ഹാൻഡിൽ ബാർ' },
  { name: 'Rear View Mirror Set (Left + Right)', category: 'Cables & Controls', ml: 'റിയർ വ്യൂ മിറർ ഗ്ലാസ്സ്' },

  // --- 10. FUEL SYSTEM & EXHAUST ---
  { name: 'Carburetor Assembly', category: 'Fuel & Exhaust', ml: 'കാർബുറേറ്റർ' },
  { name: 'Carburetor Repair Kit (Jets, Needle, O-Rings)', category: 'Fuel & Exhaust', ml: 'കാർബുറേറ്റർ റിപ്പയർ കിറ്റ്' },
  { name: 'Carburetor Float & Float Needle Pin', category: 'Fuel & Exhaust', ml: 'കാർബുറേറ്റർ ഫ്ലോട്ട്' },
  { name: 'Carburetor Insulator / Manifold Intake Pipe', category: 'Fuel & Exhaust', ml: 'ഇൻടേക്ക് മാനിഫോൾഡ്' },
  { name: 'Fuel Cock Valve / Petrol T-Valve', category: 'Fuel & Exhaust', ml: 'പെട്രോൾ ടി വാൽവ്' },
  { name: 'Fuel Pipe Hose (High Pressure)', category: 'Fuel & Exhaust', ml: 'പെട്രോൾ പൈപ്പ്' },
  { name: 'Fuel Injector Nozzle', category: 'Fuel & Exhaust', ml: 'ഫ്യുവൽ ഇഞ്ചക്ടർ' },
  { name: 'Fuel Pump Motor Assembly', category: 'Fuel & Exhaust', ml: 'ഫ്യുവൽ പമ്പ് മോട്ടോർ' },
  { name: 'Silencer Exhaust Gasket / O-Ring', category: 'Fuel & Exhaust', ml: 'സൈലൻസർ ഗ്യാസ്കറ്റ്' },
  { name: 'Oxygen (O2) Sensor', category: 'Fuel & Exhaust', ml: 'ഓക്സിജൻ സെൻസർ' },
  { name: 'Fuel Tank Cap with Keys', category: 'Fuel & Exhaust', ml: 'പെട്രോൾ ടാങ്ക് ക്യാപ്' },

  // --- 11. ENGINE INTERNAL HARDWARE ---
  { name: 'Piston & Piston Rings Kit (Std / 0.25 / 0.50)', category: 'Engine Internal', ml: 'പിസ്റ്റൺ റിങ്സ് കിറ്റ്' },
  { name: 'Cylinder Block & Piston Kit (Bore Kit)', category: 'Engine Internal', ml: 'സിലിണ്ടർ ബ്ലോക്ക് ബോർ കിറ്റ്' },
  { name: 'Engine Valves Set (Inlet & Exhaust)', category: 'Engine Internal', ml: 'എൻജിൻ വാൽവുകൾ' },
  { name: 'Valve Stem Oil Seals', category: 'Engine Internal', ml: 'വാൽവ് ഓയിൽ സീൽ' },
  { name: 'Camshaft Assembly', category: 'Engine Internal', ml: 'ക്യാംഷാഫ്റ്റ്' },
  { name: 'Rocker Arm Set', category: 'Engine Internal', ml: 'റോക്കർ ആം' },
  { name: 'Timing Chain / Cam Chain', category: 'Engine Internal', ml: 'ടൈമിംഗ് ചെയിൻ' },
  { name: 'Timing Chain Tensioner / Adjuster', category: 'Engine Internal', ml: 'ടൈമിംഗ് ചെയിൻ ടെൻഷനർ' },
  { name: 'Timing Chain Guide Pad / Roller Set', category: 'Engine Internal', ml: 'ചെയിൻ ഗൈഡ് പാഡ്' },
  { name: 'Connecting Rod Kit', category: 'Engine Internal', ml: 'കണക്റ്റിംഗ് റോഡ്' },
  { name: 'Crankshaft Main Bearings', category: 'Engine Internal', ml: 'ക്രാങ്ക് ഷാഫ്റ്റ് ബെയറിംഗ്' },
  { name: 'Full Engine Packing / Gasket Kit', category: 'Engine Internal', ml: 'എൻജിൻ ഗ്യാസ്കറ്റ് പാക്കിംഗ് കിറ്റ്' },
  { name: 'Full Engine Oil Seal Kit', category: 'Engine Internal', ml: 'എൻജിൻ ഓയിൽ സീൽ കിറ്റ്' },
  { name: 'Kick Starter Lever', category: 'Engine Internal', ml: 'കിക്ക് ലിവർ' },

  // --- 12. BODY & HARDWARE ---
  { name: 'Front Mudguard / Fender', category: 'Body & Frame', ml: 'ഫ്രണ്ട് മഡ്ഗാർഡ്' },
  { name: 'Rear Mudguard / Tail Fender', category: 'Body & Frame', ml: 'ബാക്ക് മഡ്ഗാർഡ്' },
  { name: 'Headlight Visor / Front Fairing Cowl', category: 'Body & Frame', ml: 'ഹെഡ്‌ലൈറ്റ് വൈസർ' },
  { name: 'Side Body Panel / Cover (L/R)', category: 'Body & Frame', ml: 'സൈഡ് ബോഡി പാനൽ' },
  { name: 'Footrest Rubber Front (Pair)', category: 'Body & Frame', ml: 'ഫ്രണ്ട് ഫുട്റെസ്റ്റ് റബ്ബർ' },
  { name: 'Footrest Rubber Rear / Pillion (Pair)', category: 'Body & Frame', ml: 'ബാക്ക് ഫുട്റെസ്റ്റ് റബ്ബർ' },
  { name: 'Crash Guard / Leg Guard', category: 'Body & Frame', ml: 'ലെഗ് ഗാർഡ്' },
  { name: 'Seat Cover (Rexine / Mesh Anti-Slip)', category: 'Body & Frame', ml: 'സീറ്റ് കവർ' },
  { name: 'Number Plate Frame / Plate', category: 'Body & Frame', ml: 'നമ്പർ പ്ലേറ്റ് ഫ്രെയിം' },
];

/**
 * Searches the common bike & scooter parts catalog with typo-tolerance.
 */
export function searchCommonBikeParts(rawQuery = '', limit = 12) {
  const query = (rawQuery || '').trim().toLowerCase();
  if (!query) {
    return COMMON_BIKE_PARTS.slice(0, limit);
  }

  const queryTerms = query.split(/\s+/).filter(Boolean);

  const scored = [];
  for (const part of COMMON_BIKE_PARTS) {
    const nameLower = part.name.toLowerCase();
    const catLower = part.category.toLowerCase();
    const mlLower = (part.ml || '').toLowerCase();
    const full = `${nameLower} ${catLower} ${mlLower}`;

    let matchScore = 0;

    // Direct startsWith / exact match
    if (nameLower.startsWith(query)) {
      matchScore = 150;
    } else if (nameLower.includes(query)) {
      matchScore = 100;
    } else if (mlLower.includes(query)) {
      matchScore = 90;
    } else {
      // Check individual terms
      let allTermsFound = true;
      for (const term of queryTerms) {
        if (!full.includes(term)) {
          // Allow minor 1-letter typo if word >= 4 letters
          let foundFuzzy = false;
          if (term.length >= 4) {
            const words = full.split(/\s+/);
            for (const w of words) {
              if (Math.abs(w.length - term.length) <= 1) {
                // simple char check
                let diff = 0;
                const minLen = Math.min(w.length, term.length);
                for (let i = 0; i < minLen; i++) {
                  if (w[i] !== term[i]) diff++;
                }
                diff += Math.abs(w.length - term.length);
                if (diff <= 1) {
                  foundFuzzy = true;
                  break;
                }
              }
            }
          }
          if (!foundFuzzy) {
            allTermsFound = false;
            break;
          }
        }
      }
      if (allTermsFound) {
        matchScore = 70;
      }
    }

    if (matchScore > 0) {
      scored.push({ part, score: matchScore });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.part);
}
