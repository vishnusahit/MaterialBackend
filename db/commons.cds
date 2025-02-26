namespace mdg.commons;

type t_Mara  {
   MATNR   : String(40);  
   MAKT_MAKTX      :String(100);   // Material Description
   BISMT           : String(40);   // Old Material Number
   LVORM           : Boolean;    // Deletion Indicator
   MATKL           : String(9);    // Material Group
   MBRSH           : String(1);    // Industry Sector
   MEINS          : String(3);    // Base Unit of Measure
   MEINS_UOM       : String(3);
   MSTAE : String(2);   // Cross-Plant Material Status
   MSTDE : Date;        // Date from which the Cross-Plant Material Status is Valid
   MTART           : String(4);    // Material Type
   MTART_Material_type  : String(4);
   SPART : String(2);    // Division
   EXTWG : String(18);   // External Material Group
   MAGRV : String(4);    // Material Group: Packaging Materials
   MTPOS_MARA : String(4); // General Item Category Group
   PRDHA : String(18);   // Product Hierarchy
   WRKST           : String(48);   // Basic Material
   EAN11 : String(18);   // International Article Number (EAN/UPC)
   VOLEH_unit: String(3); // Volume Unit
   VOLUM           : Decimal(13, 3); // Volume
   LAENG:Integer;
   BREIT:Integer;
   HOEHE:Integer;
   CUOBF:Integer;
   NTGEW:Decimal(13, 3);//Net Weight
   GEWEI:String(3);//Weight Unit
   BRGEW:Decimal(13, 3);//Gross Wight
   MEABM:String(3); //UNit of length/width/height
   SLED_BBD:String(1);//Expiration Date
   MHDHB:String(4);//Total Shelf Life
   RAUBE:String(2);//Storage conditions
   MHDRZ:String(4);//Minimum Remaining Shelf Life
   IPRKZ:String(1);//Period Indicator for Shelf Life Expiration Date
   TRAGR:String(4);//Transportation Group
   EKWSL:String(4);//Purchasing Value Key
   QMPUR:Boolean;//QM in Procurement Is Active
} 
type t_plant{
  mat_plant_MATNR : String(40);
  WERKS : String;
  WERKS_WERKS: String ;
  MMSTA: String(2);	//Plant-Specific Material Status
  PRCTR: String(10); //Profit Center
  PRCTR_PRCTR: String(10);
  XCHPF_marc:Boolean;//Batch Management Requirement Indicator
  DISMM:String(2);//MRP Type
  MAABC:String(1);//ABC Indicator
  DISPO:String(3);//MRP Controller
  BESKZ:String(1);//Procurement Type
  EKGRP:String(3);//Purchasing Group
  LVORM: Boolean;    // Deletion Indicator
  FIXLS:Decimal(13,3);//Fixed lot size for Supply Demand Match
  //SCM_GRPRT:Integer;//Goods Receipt Processing Time
  LADGR : String(4); //Loading Group
  MTVFP:String(2);//Checking Group for availaility check
  DGRMRPPP:String;//Material Requirements Planning (MRP) Group
  RDPRF:String(4);//Rounding Profile
  DISLS:String(2);//Lot Sizing Procedure within Materials Planning
  BSTFE:Decimal(13,3);//Fixed Lot Size
  SCM_GRPRT:String;//Goods Reciept Processing time -- need to checked
  BSTMA:Decimal(13,3);//Maximum lot size
  BSTMI:Decimal(13,3);//Minimum lot size
  BEARZ:Decimal(5,2);//processing Time
  HERKL:String(3);//Country of Origin of Material (Non-Preferential Origin)
}

type t_Storage_Location{
   plant_mat_plant_MATNR : String(40);
   plant_WERKS_WERKS: String;
   LGORT:String(4);//Storage Location
   LGPBE:String;//Storage Bin
}

type t_Description{
    Material_MATNR : String(40);
    code:String(4);
    Description:String;
}

type ErrorList { message: String; } 

type ValidationError { matnr: String;
 errors: many ErrorList; }

type FieldStatus {
    Table    : String;
    Field    : String;
    Required : Boolean;
    Visble   : Boolean;
    Editable : Boolean;
}