using { litemdg as service} from './service';

annotate service.plant with {
   WERKS                @title: 'Plant' ;
   MMSTA                @title: 'Plant-Specific Material Status';
   PRCTR                @title: 'Profit Center';
   XCHPF_marc           @title: 'Batch Management Requirement Indicator';
   DISMM                @title: 'MRP Type';
   MAABC                @title: 'ABC Indicator';
   DISPO                @title: 'MRP Controller';
   BESKZ                @title: 'Procurement Type';
   EKGRP                @title: 'Purchasing Group';
   LVORM                @title: 'Deletion Indicator';
   FIXLS                @title: 'Fixed Lot Size for Supply Demand Match';
   LADGR                @title: 'Loading Group';
   MTVFP                @title: 'Checking Group for Availability Check';
   DGRMRPPP             @title: 'Material Requirements Planning (MRP) Group';
   RDPRF                @title: 'Rounding Profile';
   DISLS                @title: 'Lot Sizing Procedure in Materials Planning';
   BSTFE                @title: 'Fixed Lot Size';
   SCM_GRPRT            @title: 'Goods Receipt Processing Time';
   BSTMA                @title: 'Maximum Lot Size';
   BSTMI                @title: 'Minimum Lot Size';
   BEARZ                @title: 'Processing Time';
   HERKL                @title: 'Country of Origin of Material (Non-Preferential Origin)';
}

annotate service.Mara with {
   MATNR         @title: 'Material Number' ;
   MAKT_MAKTX    @title: 'Material Description';
   BISMT         @title: 'Old Material Number';
   LVORM         @title: 'Deletion Indicator';
   MATKL         @title: 'Material Group';
   MBRSH         @title: 'Industry Sector';
   MEINS         @title: 'Base Unit of Measure';
   MSTAE         @title: 'Cross-Plant Material Status';
   MSTDE         @title: 'Valid From Date for Cross-Plant Material Status';
   MTART         @title: 'Material Type';
   SPART         @title: 'Division';
   EXTWG         @title: 'External Material Group';
   MAGRV         @title: 'Material Group: Packaging Materials';
   MTPOS_MARA    @title: 'General Item Category Group';
   PRDHA         @title: 'Product Hierarchy';
   WRKST         @title: 'Basic Material';
   EAN11         @title: 'International Article Number (EAN/UPC)';
   VOLEH         @title: 'Volume Unit';
   VOLUM         @title: 'Volume';
   LAENG         @title: 'Length';
   BREIT         @title: 'Width';
   HOEHE         @title: 'Height';
   CUOBF         @title: 'Internal Object Number';
   NTGEW         @title: 'Net Weight';
   GEWEI         @title: 'Weight Unit';
   BRGEW         @title: 'Gross Weight';
   MEABM         @title: 'Unit of Length/Width/Height';
   SLED_BBD      @title: 'Expiration Date';
   MHDHB         @title: 'Total Shelf Life';
   RAUBE         @title: 'Storage Conditions';
   MHDRZ         @title: 'Minimum Remaining Shelf Life';
   IPRKZ         @title: 'Period Indicator for Shelf Life Expiration Date';
   TRAGR         @title: 'Transportation Group';
   EKWSL         @title: 'Purchasing Value Key';
   QMPUR         @title: 'QM in Procurement Is Active';

}

annotate service.Sales_Delivery with {
  
   Material     @title: 'Material Association';
   VKORG        @title: 'Sales Organization';
   RDPRF        @title: 'Rounding Profile';
   PRODH        @title: 'Product Hierarchy';
   LVORM        @title: 'Deletion Indicator';
   MTPOS        @title: 'Item Category Group for Material Master';
   VTWEG        @title: 'Distribution Channel';
}