
const cds = require("@sap/cds");

const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const connectivity = require('@sap-cloud-sdk/connectivity');

async function fnReadTables(tx, req, srv) {
  const {
    Mara,
    plant,
    Description,
    Storage_Location,
    Sales_Delivery,
    Valuation,
    Alternate_UOM

  } = srv.entities;
  const { ipMatnrs } = req.data;
  // const tx = cds.transaction(req);

  const payloads = [];

  for (const matnr of ipMatnrs) {
    const mara = await tx.run(
      SELECT.one.from(Mara).where({ MATNR: matnr })
    );
    if (!mara) continue;

    const plants = await tx.run(
      SELECT.from(plant).where({ mat_plant_ID: mara.ID })
    );
    const descriptions = await tx.run(
      SELECT.from(Description).where({ Material_ID: mara.ID })
    );
    const altUOMs = await tx.run(SELECT.from(Alternate_UOM).where({ Material_ID: mara.ID }));

    const storLocs = await tx.run(
      SELECT.from(Storage_Location).where({ plant_mat_plant_ID: mara.ID })
    );
    const sales = await tx.run(
      SELECT.from(Sales_Delivery).where({ Material_ID: mara.ID })
    );
    const valuations = await tx.run(
      SELECT.from(Valuation).where({ Material_ID: mara.ID })
    );

    const payload = buildPayload(mara, plants, descriptions, altUOMs, storLocs, sales, valuations);
    payloads.push(payload);
  }

  return payloads;
}
function buildPayload(mara, plants, descriptions, altUOMs, storLocs, sales, valuations) {
  return {
    Product: mara.MATNR,
    BaseUnit: mara.MEINS,
    Division: mara.SPART,
    NetWeight: mara.NTGEW?.toString(),
    VolumeUnit: mara.VOLEH,
    WeightUnit: mara.GEWEI,
    GrossWeight: mara.BRGEW?.toString(),
    ProductType: mara.MTART,
    ProductGroup: mara.MATKL,
    ProductOldID: mara.BISMT,
    IndustrySector: mara.MBRSH,
    MaterialVolume: mara.VOLUM?.toString(),
    SizeOrDimensionText: `${mara.LAENG} X ${mara.BREIT} X ${mara.HOEHE}`,
    CrossPlantStatus: mara.MSTAE,
    ProductHierarchy: mara.PRDHA,
    ItemCategoryGroup: mara.MTPOS_MARA,
    IsMarkedForDeletion: mara.LVORM,
    ProductStandardID: mara.WRKST,
    ExternalProductGroup: mara.EXTWG,
    InternationalArticleNumberCat: mara.EAN11,

    to_Description: {
      results: descriptions.map(d => ({
        Product: mara.MATNR,
        Language: d.code,
        ProductDescription: d.Description
      }))
    },

    to_ProductUnitsOfMeasure: {
      results: altUOMs.map(uom => ({
        Product: mara.MATNR,
        BaseUnit: mara.MEINS,
        VolumeUnit: uom.VOLEH,
        WeightUnit: uom.GEWEI,
        GrossWeight: uom.BRGEW?.toString(),
        MaterialVolume: uom.VOLUM?.toString(),
        AlternativeUnit: uom.MEINH,
        QuantityNumerator: uom.UMREZ?.toString(),
        QuantityDenominator: uom.UMREN?.toString(),
        ProductMeasurementUnit: uom.MEABM,
        UnitSpecificProductWidth: uom.BREIT?.toString(),
        UnitSpecificProductHeight: uom.HOEHE?.toString(),
        UnitSpecificProductLength: uom.LAENG?.toString()
      }))
    },

    to_ProductStorage: {
      Product: mara.MATNR,
      ExpirationDate: mara.SLED_BBD,
      TotalShelfLife: mara.MHDHB,
      StorageConditions: mara.RAUBE,
      MinRemainingShelfLife: mara.MHDRZ,
      ShelfLifeExpirationDatePeriod: mara.IPRKZ
    },

    to_ProductSales: {
      Product: mara.MATNR,
      TransportationGroup: mara.TRAGR
    },

    to_ProductProcurement: {
      Product: mara.MATNR,
      PurchasingAcknProfile: mara.EKWSL
    },

    to_ProductQualityMgmt: {
      Product: mara.MATNR,
      QltyMgmtInProcmtIsActive: mara.QMPUR
    },

    to_Plant: {
      results: plants.map(p => ({
        Plant: p.WERKS,
        Product: mara.MATNR,
        MRPType: p.DISMM,
        ProcurementType: p.BESKZ,
        MRPResponsible: p.DISPO,
        ProfitCenter: p.PRCTR,
        ABCIndicator: p.MAABC,
        IsMarkedForDeletion: p.LVORM,
        FixedLotSizeQuantity: p.FIXLS?.toString(),
        GoodsReceiptDuration: p.SCM_GRPRT,
        IsInternalBatchManaged: p.XCHPF_marc,

        to_PlantSales: {
          Plant: p.WERKS,
          Product: mara.MATNR,
          LoadingGroup: p.LADGR,
          AvailabilityCheckType: p.MTVFP
        },

        to_StorageLocation: {
          results: storLocs
            .filter(s => s.plant_WERKS === p.WERKS)
            .map(s => ({
              Plant: p.WERKS,
              Product: mara.MATNR,
              StorageLocation: s.LGORT,
              IsMarkedForDeletion: false,
              WarehouseStorageBin: s.LGPBE
            }))
        },

        to_ProductSupplyPlanning: {
          Plant: p.WERKS,
          MRPType: p.DISMM,
          Product: mara.MATNR,
          Currency: "", // Fill if available
          MRPGroup: p.DGRMRPPP,
          ABCIndicator: p.MAABC,
          MRPResponsible: p.DISPO,
          ProcurementType: p.BESKZ,
          RoundingProfile: p.RDPRF,
          LotSizingProcedure: p.DISLS,
          FixedLotSizeQuantity: p.BSTFE?.toString(),
          GoodsReceiptDuration: p.SCM_GRPRT,
          MaximumLotSizeQuantity: p.BSTMA?.toString(),
          MinimumLotSizeQuantity: p.BSTMI?.toString()
        },

        to_ProductWorkScheduling: {
          Plant: p.WERKS,
          Product: mara.MATNR,
          ProductProcessingTime: p.BEARZ?.toString()
        },

        to_ProdPlantInternationalTrade: {
          Plant: p.WERKS,
          Product: mara.MATNR,
          CountryOfOrigin: p.HERKL
        }
      }))
    }
  };
}

async function callS4Destination(req, srv) {

  const definition = cds.env.requires["API_PRODUCT_SRV"];

  if (!definition || !definition.credentials?.destination) {
    throw new Error(`Missing or misconfigured cds.requires entry for: ${service}`);
  }

  const dest = await connectivity.getDestination({ destinationName: definition.credentials.destination });
  const sPath = `${definition.credentials.path}`
  if (!dest || !dest.url) {
    throw new Error(`Destination ${definition.credentials.destination} not found or lacks a URL.`);
  }

  const tx = cds.transaction(req);
  const payloads = await fnReadTables(tx, req, srv);

  const errorResults = [];
  for (const payload of payloads) {
    try {

      await executeHttpRequest(
        { destinationName: 'W46' },
        {
          method: 'POST',
          url: sPath + "/A_Product",
          data: payload,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        },
        { fetchCsrfToken: true }
      );

      console.log(`Material ${payload.Product} replicated.`);
      const successEntry = {
        ID: cds.utils.uuid(),
        MATNR: payload.Product,
        STATUS: "Success",
        Message: "Replicated Successfully",
        Timestamp: new Date(),
        REPLICATED_BY: req.user.id
      };

      await tx.run(
        INSERT.into("litemdg.ReplicationReport").entries(successEntry)
      );
      errorResults.push(successEntry);

    } catch (error) {
      const errMessage =
        error?.response?.data?.error?.message?.value ||
        error.message ||
        "Unknown error";

      console.error(`❌ Error posting material ${payload.Product}:`, errMessage);
      const errorEntry = {
        ID: cds.utils.uuid(),
        MATNR: payload.Product,
        STATUS: "Failed",
        Message: errMessage,
        Timestamp: new Date(),
        REPLICATED_BY: req.user.id
      };
      await tx.run(
        INSERT.into("litemdg.ReplicationReport").entries(errorEntry)
      );
      errorResults.push(errorEntry);

    }


  }
  return errorResults;

}

module.exports = {
  callS4Destination
}