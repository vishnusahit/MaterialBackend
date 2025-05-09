using {litemdg as service} from './service';

annotate service.plant with {
   WERKS      @title: 'Plant';
   MMSTA      @title: 'Plant-Specific Material Status';
   PRCTR      @title: 'Profit Center';
   XCHPF_marc @title: 'Batch Management Requirement Indicator';
   DISMM      @title: 'MRP Type';
   MAABC      @title: 'ABC Indicator';
   DISPO      @title: 'MRP Controller';
   BESKZ      @title: 'Procurement Type';
   EKGRP      @title: 'Purchasing Group';
   LVORM      @title: 'Deletion Indicator';
   FIXLS      @title: 'Fixed Lot Size for Supply Demand Match';
   LADGR      @title: 'Loading Group';
   MTVFP      @title: 'Checking Group for Availability Check';
   DGRMRPPP   @title: 'Material Requirements Planning (MRP) Group';
   RDPRF      @title: 'Rounding Profile';
   DISLS      @title: 'Lot Sizing Procedure in Materials Planning';
   BSTFE      @title: 'Fixed Lot Size';
   SCM_GRPRT  @title: 'Goods Receipt Processing Time';
   BSTMA      @title: 'Maximum Lot Size';
   BSTMI      @title: 'Minimum Lot Size';
   BEARZ      @title: 'Processing Time';
   HERKL      @title: 'Country of Origin of Material (Non-Preferential Origin)';
}

annotate service.Warehouse with {
   LGNUM @title: 'Warehouse Number';
   LVORM @title: 'Deletion flag';
   LGBKZ @title: 'Storage Section Indicators';
   LTKZE @title: 'Storage type indicator for stock placement';
   LTKZA @title: 'Storage type indicator for stock removal';
   LHMG1 @title: 'Loading equipment quantity 1';
   LHMG2 @title: 'Loading equipment quantity 2';
   LHMG3 @title: 'Loading equipment quantity 3';
   LHME1 @title: 'Unit of measure for loading equipment quantity 1';
   LHME2 @title: 'Unit of measure for loading equipment quantity 2';
   LHME3 @title: 'Unit of measure for loading equipment quantity 3';
   LETY1 @title: '1st storage unit type';
   LETY2 @title: '2nd storage unit type';
   LETY3 @title: '3rd storage unit type';
   LVSME @title: 'Warehouse Management Unit of Measure';
   KZZUL @title: 'Indicator: Allow addition to existing stock';
   BLOCK @title: 'Bulk Storage Indicators';
   KZMBF @title: 'Indicator: Message to inventory management';
   BSSKZ @title: 'Special movement indicator for warehouse management';
   MKAPV @title: 'Capacity usage';
   BEZME @title: 'Unit of measure for capacity consumption';
   PLKPT @title: 'Picking storage type for rough-cut and detailed planning';
   VOMEM @title: 'Default for unit of measure from material master record';
   L2SKR @title: 'Material relevance for 2-step picking';
};

annotate service.Storage_type with {
   Material @title: 'Material Number';
   LGTYP    @title: 'Storage Type';
   LVORM    @title: 'Deletion Flag';
   LGPLA    @title: 'Storage Bin';
   LPMAX    @title: 'Maximum Storage Bin Quantity';
   LPMIN    @title: 'Minimum Storage Bin Quantity';
   MAMNG    @title: 'Control Quantity';
   NSMNG    @title: 'Replenishment Quantity';
   KOBER    @title: 'Picking Area';
}

annotate service.Alternate_UOM with {
   Material @title: 'Material Number';
   MEINH    @title: 'Alternative Unit of Measure';
   UMREZ    @title: 'Conversion Numerator to Base Unit';
   UMREN    @title: 'Conversion Denominator to Base Unit';
   EANNR    @title: 'International Article Number (EAN/UPC)';
   EAN11    @title: 'EAN/UPC Category';
   NUMTP    @title: 'EAN Category (Obsolete)';
   LAENG    @title: 'Length';
   BREIT    @title: 'Width';
   HOEHE    @title: 'Height';
   MEABM    @title: 'Dimension Unit';
   VOLUM    @title: 'Volume';
   VOLEH    @title: 'Volume Unit';
   BRGEW    @title: 'Gross Weight';
   GEWEI    @title: 'Weight Unit';
}

annotate service.Mara with {
   MATNR      @title: 'Material Number';
   MAKT_MAKTX @title: 'Material Description';
   BISMT      @title: 'Old Material Number';
   LVORM      @title: 'Deletion Indicator';
   MATKL      @title: 'Material Group';
   MBRSH      @title: 'Industry Sector';
   MEINS      @title: 'Base Unit of Measure';
   MSTAE      @title: 'Cross-Plant Material Status';
   MSTDE      @title: 'Valid From Date for Cross-Plant Material Status';
   MTART      @title: 'Material Type';
   SPART      @title: 'Division';
   EXTWG      @title: 'External Material Group';
   MAGRV      @title: 'Material Group: Packaging Materials';
   MTPOS_MARA @title: 'General Item Category Group';
   PRDHA      @title: 'Product Hierarchy';
   WRKST      @title: 'Basic Material';
   EAN11      @title: 'International Article Number (EAN/UPC)';
   VOLEH      @title: 'Volume Unit';
   VOLUM      @title: 'Volume';
   LAENG      @title: 'Length';
   BREIT      @title: 'Width';
   HOEHE      @title: 'Height';
   CUOBF      @title: 'Internal Object Number';
   NTGEW      @title: 'Net Weight';
   GEWEI      @title: 'Weight Unit';
   BRGEW      @title: 'Gross Weight';
   MEABM      @title: 'Unit of Length/Width/Height';
   SLED_BBD   @title: 'Expiration Date';
   MHDHB      @title: 'Total Shelf Life';
   RAUBE      @title: 'Storage Conditions';
   MHDRZ      @title: 'Minimum Remaining Shelf Life';
   IPRKZ      @title: 'Period Indicator for Shelf Life Expiration Date';
   TRAGR      @title: 'Transportation Group';
   EKWSL      @title: 'Purchasing Value Key';
   QMPUR      @title: 'QM in Procurement Is Active';

}

annotate service.Sales_Delivery with {

   Material @title: 'Material Association';
   VKORG    @title: 'Sales Organization';
   RDPRF    @title: 'Rounding Profile';
   PRODH    @title: 'Product Hierarchy';
   LVORM    @title: 'Deletion Indicator';
   MTPOS    @title: 'Item Category Group for Material Master';
   VTWEG    @title: 'Distribution Channel';
   VERSG    @title: 'Material statistics group';
   KTGRM    @title: 'Account Assignment Group for Material';
}

annotate service.Sales_tax with {
   Country           @title: 'Country';
   TaxCategory       @title: 'Tax Category';
   TaxClassification @title: 'Tax Classification';
}

annotate service.Valuation with {
   BWKEY        @title: 'Valuation Area';
   STPRS        @title: 'Standard Price';
   BWTAR        @title: 'Valuation Type';
   BWTTY        @title: 'Valuation Category';
   BKLAS        @title: 'Valuation Class';
   CURRENCY_KEY @title: 'Currency Key';
   CURTP        @title: 'Currency Type and Valuation View';
   VERPR        @title: 'Moving Average Price / Periodic Unit Price';
   VPRSV        @title: 'Price Control Indicator';
   PEINH        @title: 'Price Unit';
   WAERS        @title: 'Currency Key';
   MLAST        @title: 'Value Updating';
   KALN1        @title: 'Costing Number for Cost Estimate with Quantity Structure';
   LVORM        @title: 'Deletion Flag';
   ZKPRS        @title: 'Future Price';
   ZKDAT        @title: 'Future Price Validity Start Date';
   PPRDZ        @title: 'Planned Price Date';
   EKALR        @title: 'Costed with Quantity Structure';
   SPERW        @title: 'Inventory Blockage Value';
};

annotate service.Storage_Location with {
   LGORT @title: 'Storage Location';
   LGPBE @title: 'Storage Bin';
};

annotate service.plant with {
   WERKS @Common.ValueList: {
      CollectionPath: 'Value_List',
      Parameters    : [
         {
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'WERKS',
            ValueListProperty: 'Value'
         },
         {
            $Type            : 'Common.ValueListParameterDisplayOnly',
            ValueListProperty: 'Description'
         },
         {
            $Type            : 'Common.ValueListParameterConstant',
            ValueListProperty: 'Fixed_Type',
            Constant         : 'Plant'
         }
      ]
   };

}

annotate service.plant @(Common: {SideEffects: {
   $Type           : 'Common.SideEffectsType',
   SourceProperties: [
      WERKS,
      DISPO,
      BESKZ,
      EKGRP,
      BEARZ,
      DISMM
   ],
   TargetProperties: [
      PRCTR,
      DISPO,
      BESKZ,
      EKGRP,
      DISMM
   ]
}});

annotate service.Mara with @(Common: {SideEffects: {
   $Type           : 'Common.SideEffectsType',
   SourceProperties: [MAKT_MAKTX],
   TargetEntities  : [to_Description]

}, });
