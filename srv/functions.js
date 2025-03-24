const cds = require("@sap/cds");
const { v4: uuidv4 } = require('uuid');

async function createWorkflowInstance(reqData, userEmail, creationTime, creationDate, req_no, Type_Request) {

    let payload = {
      definitionId:
        "eu10.bgsw-sdsc-coe-at1drpz8.changerequesttrigger.single_Material_Governance",
      context: {
        material: {
          ChangeRequest: {
            Change_Req_Number: req_no.toString(),
            Requested_By: userEmail,
            Creation_Date: creationDate,
            Creation_Time: creationTime,
            Request_Status: "To Be Approved",
            Multiple_Materials: "",
            Type_Request: Type_Request,
            Description: "",
          },
          Material: {
            Product: reqData.MATNR || "",
            BaseUnit: reqData.MEINS || "",
            Division: reqData.SPART || "",
            NetWeight: reqData.NTGEW ? reqData.NTGEW.toString() : "0.000",
            WeightUnit: reqData.GEWEI || "",
            GrossWeight: reqData.BRGEW ? reqData.BRGEW.toString() : "0.000",
            ProductType: reqData.MTART || "",
            ProductGroup: reqData.MATKL || "",
            ProductOldID: reqData.BISMT || "",
            IndustrySector: reqData.MBRSH || "",
            ProductHierarchy: reqData.PRDHA || "",
            VolumeUnit: reqData.VOLEH || "",
            MaterialVolume: reqData.VOLUM ? reqData.VOLUM.toString() : "0.000",
            CrossPlantStatus: reqData.MSTAE || "",
            ItemCategoryGroup: reqData.MTPOS_MARA || "",
            IsMarkedForDeletion: reqData.LVORM === "X",
            ProductStandardID: reqData.WRKST || "",
            ExternalProductGroup: reqData.EXTWG || "",
            to_ProductStorage: {
              Product: reqData.MATNR,
              ExpirationDate: reqData.SLED_BBD || "",
              TotalShelfLife: reqData.MHDHB || "10",
              StorageConditions: reqData.RAUBE || "",
              MinRemainingShelfLife: reqData.MHDRZ || "1",
              ShelfLifeExpirationDatePeriod: reqData.IPRKZ || "",
            },
            to_ProductSales: {
              Product: reqData.MATNR,
              TransportationGroup: reqData.TRAGR || "",
            },
            to_ProductProcurement: {
              Product: reqData.MATNR,
              PurchasingAcknProfile: reqData.EKWSL || "",
            },
            to_ProductQualityMgmt: {
              Product: reqData.MATNR,
              QltyMgmtInProcmtIsActive: false,
            },
            to_Description: [],
            to_ProductUnitsOfMeasure: [
              {
                Product: reqData.MATNR,
                BaseUnit: reqData.MEINS || "",
                VolumeUnit: reqData.VOLEH || "",
                WeightUnit: reqData.GEWEI || "",
                GrossWeight: reqData.BRGEW ? reqData.BRGEW.toString() : "0.000",
                MaterialVolume: reqData.BRGEW
                  ? reqData.BRGEW.toString()
                  : "0.000",
                AlternativeUnit: "KG" || "",
                QuantityNumerator: "1" || "",
                QuantityDenominator: "1" || "",
                ProductMeasurementUnit: reqData.MEABM || "",
                UnitSpecificProductWidth: reqData.LAENG
                  ? reqData.LAENG.toString()
                  : "1.000",
                UnitSpecificProductHeight: reqData.BREIT
                  ? reqData.BREIT.toString()
                  : "2.000",
                UnitSpecificProductLength: reqData.HOEHE
                  ? reqData.HOEHE.toString()
                  : "3.000",
              },
            ],
            to_SalesDelivery: [
              {
                Product: "",
                ProductSalesOrg: "",
                RoundingProfile: "",
                IsMarkedForDeletion: false,
                ProductHierarchy: "",
                ProductDistributionChnl: "",
                ItemCategoryGroup: "",
                to_SalesTax: [
                  {
                    Country: "",
                    Product: "",
                    TaxCategory: "",
                    TaxClassification: "",
                  },
                ],
              },
            ],
            to_Plant: [],
            to_Valuation: [
              {
                Product: "",
                ValuationArea: "",
                ValuationType: "",
                ValuationClass: "",
                PriceUnitQty: "",
                StandardPrice: "",
                IsMarkedForDeletion: false,
                to_MLAccount: [
                  {
                    Product: "",
                    ValuationArea: "",
                    ValuationType: "",
                    Currency: "",
                    CurrencyRole: "",
                    PriceUnitQty: "",
                    StandardPrice: "",
                    MovingAveragePrice: "",
                    ProductPriceControl: "",
                  },
                ],
              },
            ],
          },
        },
      },
    };
  
    // Process each plant in reqData.plant
    if (reqData.plant && Array.isArray(reqData.plant)) {
      reqData.plant.forEach((plant) => {
        let plantEntry = {
          Product: reqData.MATNR || "",
          Plant: plant.WERKS || "",
          MRPType: plant.DISMM || "",
          ProfileCode: "40", // Placeholder value
          ABCIndicator: plant.MAABC || "",
          ProfitCenter: plant.PRCTR || "",
          MRPResponsible: plant.DISPO || "",
          ProcurementType: plant.BESKZ || "",
          PurchasingGroup: plant.EKGRP || "",
          IsMarkedForDeletion: plant.LVORM === "X",
          FixedLotSizeQuantity: plant.FIXLS ? plant.FIXLS.toString() : "0",
          GoodsReceiptDuration: plant.SCM_GRPRT || "1",
          IsInternalBatchManaged: plant.XCHPF_marc === "X",
          ProfileValidityStartDate: "", // Placeholder
          to_StorageLocation: [],
          to_PlantSales: {
            AvailabilityCheckType: plant.MTVFP || "",
            LoadingGroup: plant.LADGR || "",
            Product: reqData.MATNR || "",
            Plant: plant.WERKS || "",
          },
          to_ProductSupplyPlanning: {
            Plant: plant.WERKS || "",
            MRPType: plant.DISMM || "",
            Product: reqData.MATNR || "",
            Currency: "JPY",
            MRPGroup: plant.DGRMRPPP || "",
            ABCIndicator: plant.MAABC || "",
            MRPResponsible: plant.DISPO || "",
            ProcurementType: plant.BESKZ || "",
            RoundingProfile: plant.RDPRF || "",
            LotSizingProcedure: plant.DISLS || "",
            FixedLotSizeQuantity: plant.BSTFE ? plant.BSTFE.toString() : "0",
            GoodsReceiptDuration: plant.SCM_GRPRT || "1",
            MaximumLotSizeQuantity: plant.BSTMA ? plant.BSTMA.toString() : "0",
            MinimumLotSizeQuantity: plant.BSTMI ? plant.BSTMI.toString() : "0",
          },
          to_ProductWorkScheduling: {
            Plant: plant.WERKS || "",
            Product: reqData.MATNR || "",
            ProductProcessingTime: plant.BEARZ ? plant.BEARZ.toString() : "0",
          },
          to_ProdPlantInternationalTrade: {
            Plant: plant.WERKS || "",
            Product: reqData.MATNR || "",
            CountryOfOrigin: plant.HERKL || "JP",
          },
        };
  
        if (
          plant.to_Storage_Location &&
          Array.isArray(plant.to_Storage_Location)
        ) {
          plant.to_Storage_Location.forEach((storage) => {
            let storageEntry = {
              Product: reqData.MATNR || "",
              Plant: plant.WERKS || "",
              StorageLocation: storage.LGORT || "",
              IsMarkedForDeletion: false, // Placeholder
              WarehouseStorageBin: storage.LGPBE || "",
            };
            plantEntry.to_StorageLocation.push(storageEntry);
          });
        }
  
        // Push the plant entry to the to_Plant array
        payload.context.material.Material.to_Plant.push(plantEntry);
      });
    }
  
    if (reqData.to_Description && Array.isArray(reqData.to_Description)) {
      reqData.to_Description.forEach((Description) => {
        let DescriptionEntry = {
          Product: reqData.MATNR,
          Language: Description.code,
          ProductDescription: Description.Description || "",
        };
        payload.context.material.Material.to_Description.push(DescriptionEntry);
      });
    }
  
    const WF_API = await cds.connect.to('sap_process_automation_service_user_access_New');
    const result = await WF_API.send('POST', '/workflow/rest/v1/workflow-instances', JSON.stringify(payload), {
        "Content-Type": "application/json"
    });
  
    return result;
  }
  
  async function Rules_validation(req, srv) {
    const { RulesHeader, RuleLineItems } = srv.entities
    const { ID } = req.data;
    let modifiedCondition = "";
    let error_msg, default_value;
    let error_array = ['1st errror', '2nd error']
  
    const ruleHeaders = await SELECT.from(RulesHeader).where({ tableEntity: "Material", ruleType: "Validation" });
    if (ruleHeaders.length > 0) {
      for (const ruleHeader of ruleHeaders) {
  
        const ruleLineItems = await SELECT.from(RuleLineItems).where({
          ruleHeader_ID: ruleHeader.ID
        });
  
        let conditions = [];
        if (ruleLineItems.length > 0) {
          for (const rule of ruleLineItems) {
  
            const { modelTable, modelTableField, operator, modelTableFieldValue, errorMessage, defaultValue } = rule;
            let fieldValue;
            error_msg = errorMessage;
            default_value = defaultValue;
  
            if (modelTable === "MARA") {
              const query = await SELECT.from("litemdg.mara.drafts")
                .columns(modelTableField)
                .where({ id: ID });
  
              const fieldKey = modelTableField.toLowerCase();
              fieldValue = query[0] ? query[0][fieldKey] : null;
            } else if (modelTable === "MARC") {
              const query = await SELECT.from("litemdg.Plant.drafts")
                .columns(modelTableField)
                .where({ mat_Plant_ID: ID });
  
              const fieldKey = modelTableField.toLowerCase();
              fieldValue = query[0] ? query[0][fieldKey] : null;
            }
  
  
            if (fieldValue !== undefined && fieldValue !== null) {
              let condition = `('${fieldValue}' == '${modelTableFieldValue}')`;
              conditions.push(condition);
              if (conditions.length > 0) {
                if (operator && (operator === "OR" || operator === "AND")) {
                  conditions[conditions.length - 1] += ` ${operator}`;
                }
              }
            }
          }
        }
  
  
        modifiedCondition = conditions.join(" ").replace(/ OR /g, " || ").replace(/ AND /g, " && ").replace();
  
  
        const conditionMet = evaluateCondition(modifiedCondition);
  
        function evaluateCondition(condition) {
          try {
            return eval(condition);
          } catch (error) {
            console.error("Error evaluating condition:", error);
            return false;
          }
        }
  
  
        if (conditionMet && ruleHeader.isMandatory === false) {
  
          let defaultValues = [];
  
          if (typeof default_value === 'string' && default_value.includes(',')) {
            defaultValues = default_value.split(',').map(val => val.trim());
          } else {
            defaultValues = [default_value];
          }
  
          function normalizeValue(value, type) {
            if (type === "number") {
              return parseFloat(value);
            } else if (type === "string") {
              return String(value).replace(/^0+/, "");
            }
            return value;
          }
  
          const targetValue = req.data[ruleHeader.targetField];
          const targetType = typeof targetValue;
  
          const normalizedDefaults = defaultValues.map(val => normalizeValue(val, targetType));
  
  
          if (!normalizedDefaults.includes(normalizeValue(targetValue, targetType))) {
            req.error({
              code: 'Validation Error',
              message: error_msg,
              status: 418
            })
  
          }
  
          // if (!defaultValues.includes(req.data[ruleHeader.targetField])) {
          //     req.error(500, error_msg);
          // }
        } else if (conditionMet && ruleHeader.isMandatory === true) {
          if (req.data[ruleHeader.targetField] === null || req.data[ruleHeader.targetField] === undefined) { // Corrected equality checks
            req.error(500, error_msg);
          }
        }
  
      }
    }
  
  }
  
  async function Rules_Derivation(req, srv, entity, ID) {
    const { RulesHeader, RuleLineItems } = srv.entities
    const mat_ID = ID;
    let modifiedCondition = "";
    let default_value;
  
    const ruleHeaders = await SELECT.from(RulesHeader).where({ tableEntity: entity, ruleType: "Derivation" });
    if (ruleHeaders.length > 0) {
      for (const ruleHeader of ruleHeaders) {
  
        const ruleLineItems = await SELECT.from(RuleLineItems).where({
          ruleHeader_ID: ruleHeader.ID
        });
  
        let conditions = [];
        if (ruleLineItems.length > 0) {
          for (const rule of ruleLineItems) {
  
            const { modelTable, modelTableField, operator, modelTableFieldValue, defaultValue } = rule;
            let fieldValue;
            default_value = defaultValue;
  
            if (entity === "Plant") {
              if (modelTable === "MARA") {
                const query = await SELECT.from("litemdg.mara.drafts")
                  .columns(modelTableField)
                  .where({ id: mat_ID });
  
                const fieldKey = modelTableField.toLowerCase();
                fieldValue = query[0] ? query[0][fieldKey] : null;
              } else if (modelTable === "MARC") {
                fieldValue = req.data[modelTableField];
              }
            } else if (entity === "Material") {
              if (modelTable === "MARA") {
                fieldValue = req.data[modelTableField];
              }
            } else if (entity === "Sales") {
              if (modelTable === "MARA") {
                const query = await SELECT.from("litemdg.mara.drafts")
                  .columns(modelTableField)
                  .where({ id: mat_ID });
  
                const fieldKey = modelTableField.toLowerCase();
                fieldValue = query[0] ? query[0][fieldKey] : null;
              } else if (modelTable === "Sales") {
                fieldValue = req.data[modelTableField];
              }
            } else if (entity === "Valuation") {
              if (modelTable === "MARA") {
                const query = await SELECT.from("litemdg.mara.drafts")
                  .columns(modelTableField)
                  .where({ id: mat_ID });
  
                const fieldKey = modelTableField.toLowerCase();
                fieldValue = query[0] ? query[0][fieldKey] : null;
              } else if (modelTable === "Valuation") {
                fieldValue = req.data[modelTableField];
              }
            } else if (entity === "StorageLocation") {
              if (modelTable === "MARA") {
                const query = await SELECT.from("litemdg.mara.drafts")
                  .columns(modelTableField)
                  .where({ id: mat_ID });
  
                const fieldKey = modelTableField.toLowerCase();
                fieldValue = query[0] ? query[0][fieldKey] : null;
              } else if (modelTable === "MARC") {
                const query = await SELECT.from("litemdg.Plant.drafts")
                  .columns(modelTableField)
                  .where({ mat_plant_ID: mat_ID });
  
                const fieldKey = modelTableField.toLowerCase();
                fieldValue = query[0] ? query[0][fieldKey] : null;
              } else if (modelTable === "StorageLocation") {
                fieldValue = req.data[modelTableField];
              }
  
            }
  
  
            if (fieldValue !== undefined && fieldValue !== null) {
              let condition = `('${fieldValue}' == '${modelTableFieldValue}')`;
              conditions.push(condition);
              if (conditions.length > 0) {
                if (operator && (operator === "OR" || operator === "AND")) {
                  conditions[conditions.length - 1] += ` ${operator}`;
                }
              }
            }
          }
        }
  
  
        modifiedCondition = conditions.join(" ").replace(/ OR /g, " || ").replace(/ AND /g, " && ").replace();
  
  
        const conditionMet = evaluateCondition(modifiedCondition);
  
        function evaluateCondition(condition) {
          try {
            return eval(condition);
          } catch (error) {
            console.error("Error evaluating condition:", error);
            return false;
          }
        }
  
        // Update ProfitCenter if condition is met
        if (conditionMet) {
          req.data[ruleHeader.targetField] = default_value
          req.info({
            code: "REFRESH",
            message: "Data has been updated, please refresh.",
            numericSeverity: 1, // Info level
            target: "/plant",
          });
        }
      }
    }
  
  }
  
  async function Rules_default(req,srv,entity,ID) {
    const { RulesHeader, RuleLineItems } = srv.entities
    
    console.log("1."+ RulesHeader);
    console.log("2"+req.data);
    console.log("3"+RuleLineItems)
    const ruleHeaders = await SELECT.from(RulesHeader).where({ tableEntity: entity, ruleType: "Default" });
    if (ruleHeaders.length > 0) {
      for (const ruleHeader of ruleHeaders) {
        var default_value;
  
        const ruleLineItems = await SELECT.from(RuleLineItems).where({
          ruleHeader_ID: ruleHeader.ID
        });
        if (ruleLineItems.length > 0) {
          for (const rule of ruleLineItems) {
            const { defaultValue } = rule;
            default_value = defaultValue;
          }
        }
        req.data[ruleHeader.targetField] = default_value
  
      }
    }
  
    console.log("Updated Data:", req.data);
  }
  
  async function generateCUID() {
    return uuidv4().slice(0, 36); 
  }
  
  async function Move_To_Dummy(req,srv) {
    const {
      Mara,
      plant,
      Plant_dummy,
      Storage_dummy,
      mara_dummy,
      Description_dummy,
      Storage_Location,
      Description,
      Valuation_dummy,
      Valuation,
      Sales_Delivery,
      Sales_dummy
    } = srv.entities;
    const { ID } = req.data;
    // await DELETE.from("litemdg.mara_dummy").where({ ID: ID });
    const tx = cds.transaction(req);
  
    try {
  
      const maraData = await tx.run(
        SELECT.one.from(Mara).where({ ID })
      );
  
      if (!maraData) {
        return;
      }
  
  
      await tx.run(INSERT.into(mara_dummy).entries(maraData));
  
      // Fetch and copy Plant details
      const plantData = await tx.run(
        SELECT.from(plant).where({ mat_plant_ID: ID })
      );
  
      if (plantData.length) {
        await tx.run(INSERT.into(Plant_dummy).entries(plantData));
      }
      var storageData = []
  
      for (const entry of plantData) {
        var LocationData = await tx.run(SELECT.from(Storage_Location).where({ plant_mat_plant_ID: entry.mat_plant_ID, plant_WERKS: entry.WERKS }));
        storageData.push(...LocationData)
      }
      if (storageData.length) {
        await tx.run(INSERT.into(Storage_dummy).entries(storageData));
      }
  
      const salesDeliveryData = await tx.run(
        SELECT.from(Sales_Delivery).where({ Material_ID: ID })
      );
  
      if (salesDeliveryData.length) {
        await tx.run(INSERT.into(Sales_dummy).entries(salesDeliveryData));
      }
  
      // Fetch and copy Valuation details
      const valuationData = await tx.run(
        SELECT.from(Valuation).where({ Material_ID: ID })
      );
  
      if (valuationData.length) {
        await tx.run(INSERT.into(Valuation_dummy).entries(valuationData));
      }
  
      // Fetch and copy Description details
      const descriptionData = await tx.run(
        SELECT.from(Description).where({ Material_ID: ID })
      );
  
      if (descriptionData.length) {
        await tx.run(INSERT.into(Description_dummy).entries(descriptionData));
      }
      await tx.commit();
      console.log(`Successfully copied data for Material ID: ${ID}`);
    } catch (error) {
      await tx.rollback();  // Rollback the transaction
      console.error("Error while copying data:", error);
      throw new Error(`Data copy failed: ${error.message}`);
    }
    
  }
  
  async function CallEntity(entity, data) {
    if (entity === Rules) {
      //If any custom handling required for a particular entity
    }
    const insertQuery = INSERT.into(entity).entries(data);
    // This calls the service handler of respective entity. It can be used if any custom
    //validations need to be performed. or else custom handlers can be skipped.
  
    let srv = await cds.connect.to("StudentsSrv");
    const insertResult = await srv.run(insertQuery);
    let query = SELECT.from(entity);
    await srv.run(query);
    return insertResult; //returns response to excel upload entity
  }

module.exports = {
    CallEntity,
    Move_To_Dummy,
    Rules_Derivation,
    Rules_default,
    Rules_validation,
    createWorkflowInstance,
    generateCUID
}