const cds = require("@sap/cds");
const { v4: uuidv4 } = require('uuid');

module.exports = class Service extends cds.ApplicationService {
  init() {
    //
    const {
      Mara,
      ExcelUpload,
      plant,
      Plant_dummy,
      Storage_dummy,
      mara_dummy,
      Description_dummy,
      Storage_Location,
      Description,
      Change_Request,
      Change_Request_Details,
      Valuation_dummy,
      Valuation,
      Sales_Delivery,
      Sales_dummy
    } = this.entities;
    console.log(Object.keys(this.entities));
    const srv = this;

    srv.after(["CREATE"], "Mara.drafts", async (req) => {
      const { ID, MATNR } = req;

      req.Status = "Inactive";
      const maxRequest = await SELECT.one
        .from("litemdg.Change_Request")
        .columns("REQUEST_NUMBER")
        .where("REQUEST_NUMBER IS NOT NULL")
        .orderBy({ REQUEST_NUMBER: "desc" });

      let req_no =
        maxRequest && maxRequest.REQUEST_NUMBER !== undefined
          ? maxRequest.REQUEST_NUMBER + 1
          : 1;

      const result = await SELECT.one
        .from("litemdg.mara_dummy")
        .columns([{ MAX_NO: "MAX(MAX_NO)" }])
        .where({ REQUEST_NUMBER: req_no });
      let max_no =
        result && result["MAX(MAX_NO)"] !== undefined
          ? result["MAX(MAX_NO)"] + 1
          : 1;

      const maraDummyData = {
        ID: ID,
        MATNR: MATNR,
        REQUEST_NUMBER: req_no,
        MAX_NO: max_no,
      };

      await INSERT.into("litemdg.mara_dummy").entries(maraDummyData);

      await UPDATE("litemdg.mara.drafts")
        .set({ Status: "Inactive" })
        .where({ ID: ID });
    });

    srv.after(["UPDATE"], "Mara.drafts", async (req) => {
      const { ID } = req;

      const mara_data = await SELECT.one
        .from(Mara)
        .where({ ID: ID });

      if (!mara_data) {
        const existingMaraDummyData = await SELECT.one
          .from("litemdg.mara_dummy")
          .where({ ID: ID });

        const maxRequest = await SELECT.one
          .from("litemdg.Change_Request")
          .columns("REQUEST_NUMBER")
          .where("REQUEST_NUMBER IS NOT NULL")
          .orderBy({ REQUEST_NUMBER: "desc" });

        let req_no =
          maxRequest && maxRequest.REQUEST_NUMBER !== undefined
            ? maxRequest.REQUEST_NUMBER + 1
            : 1;

        const result = await SELECT.one
          .from("litemdg.mara_dummy")
          .columns([{ MAX_NO: "MAX(MAX_NO)" }])
          .where({ REQUEST_NUMBER: req_no });
        let max_no =
          result && result["MAX(MAX_NO)"] !== undefined
            ? result["MAX(MAX_NO)"] + 1
            : 1;

        const updatedData = {
          MATNR:
            req.MATNR !== undefined ? req.MATNR : existingMaraDummyData.MATNR,
          BISMT:
            req.BISMT !== undefined ? req.BISMT : existingMaraDummyData.BISMT,
          LVORM:
            req.LVORM !== undefined ? req.LVORM : existingMaraDummyData.LVORM,
          MATKL:
            req.MATKL !== undefined ? req.MATKL : existingMaraDummyData.MATKL,
          MBRSH:
            req.MBRSH !== undefined ? req.MBRSH : existingMaraDummyData.MBRSH,
          MEINS:
            req.MEINS_UOM !== undefined
              ? req.MEINS_UOM
              : existingMaraDummyData.MEINS_UOM,
          MSTAE:
            req.MSTAE !== undefined ? req.MSTAE : existingMaraDummyData.MSTAE,
          MSTDE:
            req.MSTDE !== undefined ? req.MSTDE : existingMaraDummyData.MSTDE,
          MTART_Material_type:
            req.MTART_Material_type !== undefined
              ? req.MTART_Material_type
              : existingMaraDummyData.MTART_Material_type,
          SPART:
            req.SPART !== undefined ? req.SPART : existingMaraDummyData.SPART,
          XCHPF:
            req.XCHPF !== undefined ? req.XCHPF : existingMaraDummyData.XCHPF,
          EXTWG:
            req.EXTWG !== undefined ? req.EXTWG : existingMaraDummyData.EXTWG,
          MAGRV:
            req.MAGRV !== undefined ? req.MAGRV : existingMaraDummyData.MAGRV,
          MTPOS_MARA:
            req.MTPOS_MARA !== undefined
              ? req.MTPOS_MARA
              : existingMaraDummyData.MTPOS_MARA,
          PRDHA:
            req.PRDHA !== undefined ? req.PRDHA : existingMaraDummyData.PRDHA,
          WRKST:
            req.WRKST !== undefined ? req.WRKST : existingMaraDummyData.WRKST,
          EAN11:
            req.EAN11 !== undefined ? req.EAN11 : existingMaraDummyData.EAN11,
          VOLEH:
            req.VOLEH_unit !== undefined
              ? req.VOLEH_unit
              : existingMaraDummyData.VOLEH_unit,
          VOLUM:
            req.VOLUM !== undefined ? req.VOLUM : existingMaraDummyData.VOLUM,
          // MMSTA: req.MMSTA !== undefined ? req.MMSTA : existingMaraDummyData.MMSTA,
          // PRCTR: req.PRCTR !== undefined ? req.PRCTR : existingMaraDummyData.PRCTR,
          // XCHPF_marc: req.XCHPF_marc !== undefined ? req.XCHPF_marc : existingMaraDummyData.XCHPF_marc,
          DISGR:
            req.DISGR !== undefined ? req.DISGR : existingMaraDummyData.DISGR,
          LADGR:
            req.LADGR !== undefined ? req.LADGR : existingMaraDummyData.LADGR,
          LAENG:
            req.LAENG !== undefined ? req.LAENG : existingMaraDummyData.LAENG,
          BREIT:
            req.BREIT !== undefined ? req.BREIT : existingMaraDummyData.BREIT,
          HOEHE:
            req.HOEHE !== undefined ? req.HOEHE : existingMaraDummyData.HOEHE,
          CUOBF:
            req.CUOBF !== undefined ? req.CUOBF : existingMaraDummyData.CUOBF,
          MAKT_MAKTX:
            req.MAKT_MAKTX !== undefined
              ? req.MAKT_MAKTX
              : existingMaraDummyData.MAKT_MAKTX,
          REQUEST_NUMBER: req_no,
          CREATION_TYPE: "SINGLE",
          Status: "Inactive",
          MAX_NO: max_no,
        };
        await UPDATE("litemdg.mara_dummy").set(updatedData).where({ ID: ID });
      }
    });
    srv.before(["DELETE"], "Mara.drafts", async (req) => {
      const { ID } = req.data;

      await DELETE.from("litemdg.mara_dummy").where({ ID: ID });
    });
    srv.before(["CREATE"], "Plant.drafts", async (req) => {
      const { mat_plant_ID } = req.data;

      await DELETE.from("litemdg.mara_dummy").where({ ID: ID });
    });

    srv.before(["UPDATE"], "plant.drafts", async (req) => {
      let IsNull;
      let Column_name = "PRCTR";
      const { mat_plant_ID } = req.data;

      // const result = await SELECT.from('litemdg.Mara.drafts').where({ ID: ID}) ;
      // const matplantID = await SELECT.from('litemdg.plant.drafts')
      //   .columns('mat_plant_ID')
      //   .where({ mat_Plant_ID: mat_Plant_ID , mat_plant_MATNR: mat_plant_MATNR , WERKS_WERKS:WERKS_WERKS });

      const mat_Plant_ID = mat_plant_ID;

      const rules = await SELECT.from("litemdg.rules").where({
        Table_name: "plant",
      });

      for (const rule of rules) {
        const { column_name, rule_definition, rule_value } = rule;

        let modifiedCondition = rule_definition;

        // let ruleCondition = "MARC.WERKS = 'Y110'";
        // let modifiedCondition = ruleCondition;

        try {
          // Extract fields prefixed with "MARA."
          const maraFields = [
            ...rule_definition.matchAll(/MARA\.([a-zA-Z_]+)/g),
          ].map((match) => match[1]);

          // Fetch field values from the database
          for (const field of maraFields) {
            const query = await SELECT.from("litemdg.mara.drafts")
              .columns(field)
              .where({ id: mat_Plant_ID });
            const result = query[0][field];
            IsNull = query[0]["prctr"];

            modifiedCondition = modifiedCondition.replace(
              `MARA.${field}`,
              `'${result}'`
            );
          }

          // Replace "MARC" references if needed
          modifiedCondition = modifiedCondition
            .replace(/MARC/g, "req.data")
            .replace(/(?<![=!<>])=(?![=<>])/g, "==")
            .replace(/\bOR\b/g, "||")
            .replace(/\bAND\b/g, "&&");

          // Evaluate the condition (use a safe evaluation method)
          const conditionMet = evaluateCondition(modifiedCondition); // Example eval function below.

          function evaluateCondition(modifiedCondition) {
            try {
              return eval(modifiedCondition);
            } catch (error) {
              console.error("Error evaluating condition:", error);
              return false;
            }
          }

          // Update PRCTR if condition is true
          if (conditionMet) {
            req.data[column_name] = rule_value;
            req.info({
              code: "REFRESH",
              message: "Data has been updated, please refresh.",
              numericSeverity: 1, // Info level
              target: "/plant",
            });
          }
        } catch (error) {
          console.error("Error processing rule condition:", error);
        }
      }
    });

    srv.after(["EDIT"], Mara, async (req) => {

      const { ID } = req;
      await DELETE.from("litemdg.mara_dummy").where({ ID: ID });
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
        for (entry of plantData) {
          var LocationData = await tx.run(SELECT.from(Storage_Location).where({ plant_mat_plant_ID: entry.mat_plant_ID, plant_WERKS_WERKS: entry.WERKS }));
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
        console.error("Error while copying data:", error);
      }
    });



    // srv.before(["CREATE"], Mara, async (req) => {
    //   console.log(req.user);

    //   const flag = await SELECT.one
    //     .from("litemdg.mara_dummy")
    //     .columns("CREATION_TYPE")
    //     .where({ ID: req.data.ID });

    //   if (flag.CREATION_TYPE == "SINGLE") {
    //     const timestamp = new Date(req.timestamp);

    //     const creationDate =
    //       timestamp.getFullYear() +
    //       String(timestamp.getMonth() + 1).padStart(2, "0") +
    //       String(timestamp.getDate()).padStart(2, "0");

    //     const creationTime =
    //       String(timestamp.getHours()).padStart(2, "0") +
    //       String(timestamp.getMinutes()).padStart(2, "0") +
    //       String(timestamp.getSeconds()).padStart(2, "0");

    //     const maxRequest = await SELECT.one
    //       .from("litemdg.Change_Request")
    //       .columns("REQUEST_NUMBER")
    //       .where("REQUEST_NUMBER IS NOT NULL")
    //       .orderBy({ REQUEST_NUMBER: "desc" });

    //     let req_no =
    //       maxRequest && maxRequest.REQUEST_NUMBER !== undefined
    //         ? maxRequest.REQUEST_NUMBER + 1
    //         : 1;

    //     const result = await createWorkflowInstance(
    //       req.data,
    //       req.user.attr.email,
    //       timestamp,
    //       req_no
    //     );

    //     // if (result.rootInstanceId){

    //     // await INSERT.into("litemdg.Change_Request").entries({
    //     //   REQUEST_NUMBER: req_no,
    //     //   // InstanceID: result.rootInstanceId,
    //     //   REQUEST_TYPE: "CREATE",
    //     //   Overall_status: "Open",
    //     //   Model: "Material",
    //     //   Requested_By: req.user.attr.email,
    //     //   Requested_Date: creationDate,
    //     //   Requested_Time: creationTime,
    //     //   Requested_on: timestamp,

    //     // });

    //     // await INSERT.into("litemdg.Change_Request_details").entries({
    //     //   Change_REQUEST_NUMBER: req_no,
    //     //   Object_ID: req.data.MATNR,
    //     //   Description: req.data.MAKT_MAKTX,
    //     //   Object_CUID: req.data.ID,
    //     // });
    //     req.notify(`Request Number#${req_no} submitted for approval`);
    //   }

    //   // console.log(result);

    //   // }
    // });

    srv.before(["SAVE"], Mara, async (req) => {

      console.log(req.user);

      const flag = await SELECT.one
        .from("litemdg.mara_dummy")
        .columns("CREATION_TYPE")
        .where({ ID: req.data.ID });

      const timestamp = new Date(req.timestamp);

      const creationDate =
        timestamp.getFullYear() +
        String(timestamp.getMonth() + 1).padStart(2, "0") +
        String(timestamp.getDate()).padStart(2, "0");

      const creationTime =
        String(timestamp.getHours()).padStart(2, "0") +
        String(timestamp.getMinutes()).padStart(2, "0") +
        String(timestamp.getSeconds()).padStart(2, "0");

      const maxRequest = await SELECT.one
        .from("litemdg.Change_Request")
        .columns("REQUEST_NUMBER")
        .where("REQUEST_NUMBER IS NOT NULL")
        .orderBy({ REQUEST_NUMBER: "desc" });

      let req_no =
        maxRequest && maxRequest.REQUEST_NUMBER !== undefined
          ? maxRequest.REQUEST_NUMBER + 1
          : 1;
      if (req.event === "CREATE") {
        if (flag.CREATION_TYPE == "SINGLE") {

          await DELETE.from("litemdg.mara_dummy").where({ ID: req.data.ID });
          var Type_Request = 'CREATE'
          const result = await createWorkflowInstance(
            req.data,
            req.user.attr.email,
            creationTime,
            creationDate,
            req_no,
            Type_Request
          );

            if (result.rootInstanceId) {

              await INSERT.into("litemdg.Change_Request").entries({
                REQUEST_NUMBER: req_no,
                InstanceID: result.rootInstanceId,
                REQUEST_TYPE: "CREATE",
                Overall_status: "Open",
                Model: "Material",
                Requested_By: req.user.attr.email,
                Requested_Date: creationDate,
                Requested_Time: creationTime,
                Requested_on: timestamp,
              });

              await INSERT.into("litemdg.Change_Request_details").entries({
                Change_REQUEST_NUMBER: req_no,
                Object_ID: req.data.MATNR,
                Description: req.data.MAKT_MAKTX,
                Object_CUID: req.data.ID,
                Overall_status: "Open",

              });
              req.notify(`Request Number#${req_no} submitted for approval`);
            }
        }
      }
      if (req.event === "UPDATE") {
        var Type_Request = 'CHANGE'
        const result = await createWorkflowInstance(req.data, req.user.attr.email, creationTime, creationDate, req_no, Type_Request);

        if (result.rootInstanceId) {

          await INSERT.into("litemdg.Change_Request").entries({
            REQUEST_NUMBER: req_no,
            InstanceID: result.rootInstanceId,
            REQUEST_TYPE: "CHANGE",
            Overall_status: "Open",
            Model: "Material",
            Requested_By: req.user.attr.email,
            Requested_Date: creationDate,
            Requested_Time: creationTime,
            Requested_on: timestamp,

          });

          await INSERT.into("litemdg.Change_Request_details").entries({
            Change_REQUEST_NUMBER: req_no,
            Object_ID: req.data.MATNR,
            Description: req.data.MAKT_MAKTX,
            Object_CUID: req.data.ID,
            Overall_status: "Open",
          });
          req.notify(`Request Number#${req_no} submitted for approval`);
        }
      }

    });

    srv.after(["UPDATE"], Change_Request, async (req) => {
      const { REQUEST_NUMBER } = req;

      if (req.Overall_status !== undefined && req.Overall_status !== null) {

        const changeRequestData = await SELECT.one
          .from(Change_Request)
          .where({ REQUEST_NUMBER: REQUEST_NUMBER });

        if (!changeRequestData) return;

        const materialData = await SELECT.one
          .from(Change_Request_Details)
          .where({ Change_REQUEST_NUMBER: changeRequestData.REQUEST_NUMBER });

        if (!materialData || !materialData.Object_ID) return;

        const materialNumbers = materialData.map((entry) => entry.Object_ID);


        if (req.Overall_status === "Approved" && (changeRequestData.REQUEST_TYPE === "CREATE" || changeRequestData.REQUEST_TYPE === "MASS_CREATE")) {
          await UPDATE(Mara)
            .set({ status: "Active" })
            .where({ MATNR: { in: materialNumbers } });

            await UPDATE(Change_Request_Details)
            .set({ Overall_status: "Approved" })
            .where({ Change_REQUEST_NUMBER: REQUEST_NUMBER })

          await UPDATE(Change_Request)
            .set({ Overall_status: "Approved" })
            .where({ REQUEST_NUMBER: REQUEST_NUMBER })

          console.log(
            `Updated Mara status to Active for Material Number: ${materialData.MATERIAL_NUMBER}`
          );
        }
        else if (req.Overall_status === "Rejected" && (changeRequestData.REQUEST_TYPE === "CREATE" || changeRequestData.REQUEST_TYPE === "MASS_CREATE")) {

          await UPDATE(Change_Request_Details)
          .set({ Overall_status: "Rejected" })
          .where({ Change_REQUEST_NUMBER: REQUEST_NUMBER })

          await UPDATE(Change_Request)
          .set({ Overall_status: "Rejected" })
          .where({ REQUEST_NUMBER: REQUEST_NUMBER })

          await DELETE.from(Mara).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(plant).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_Location).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_Delivery).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description).where({ Material_MATNR: { in: materialNumbers } });

          console.log(
            `Deleted entry from mara_staging for Material Number: ${materialData.MATERIAL_NUMBER}`
          );
        }
        else if (req.Overall_status === "Approved" && changeRequestData.REQUEST_TYPE === "CHANGE") {

          await UPDATE(Mara)
            .set({ status: "Active" })
            .where({ MATNR: { in: materialNumbers } });

          await UPDATE(Change_Request_Details)
            .set({ Overall_status: "Approved" })
            .where({ Change_REQUEST_NUMBER: REQUEST_NUMBER })

          await UPDATE(Change_Request)
            .set({ Overall_status: "Approved" })
            .where({ REQUEST_NUMBER: REQUEST_NUMBER })

          await DELETE.from(mara_dummy).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(Plant_dummy).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_dummy).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_dummy).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation_dummy).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description_dummy).where({ Material_MATNR: { in: materialNumbers } });

          console.log(`Deleted entries from all dummy tables for Material Numbers: ${materialNumbers}`);

        }
        else if (req.Overall_status === "Rejected" && changeRequestData.REQUEST_TYPE === "CHANGE") {

          await UPDATE(Change_Request_Details)
          .set({ Overall_status: "Rejected" })
          .where({ Change_REQUEST_NUMBER: REQUEST_NUMBER })

        await UPDATE(Change_Request)
          .set({ Overall_status: "Rejected" })
          .where({ REQUEST_NUMBER: REQUEST_NUMBER })


          await DELETE.from(Mara).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(plant).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_Location).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_Delivery).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description).where({ Material_MATNR: { in: materialNumbers } });

          console.log(`Deleted entries from original tables for Material Numbers: ${materialNumbers}`);


          const maraData = await SELECT.from(mara_dummy).where({ MATNR: { in: materialNumbers } });
          if (maraData.length) await INSERT.into(Mara).entries(maraData);

          const plantData = await SELECT.from(Plant_dummy).where({ mat_plant_MATNR: { in: materialNumbers } });
          if (plantData.length) await INSERT.into(plant).entries(plantData);

          const storageData = await SELECT.from(Storage_dummy).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          if (storageData.length) await INSERT.into(Storage_Location).entries(storageData);

          const salesData = await SELECT.from(Sales_dummy).where({ Material_MATNR: { in: materialNumbers } });
          if (salesData.length) await INSERT.into(Sales_Delivery).entries(salesData);

          const valuationData = await SELECT.from(Valuation_dummy).where({ Material_MATNR: { in: materialNumbers } });
          if (valuationData.length) await INSERT.into(Valuation).entries(valuationData);

          const descriptionData = await SELECT.from(Description_dummy).where({ Material_MATNR: { in: materialNumbers } });
          if (descriptionData.length) await INSERT.into(Description).entries(descriptionData);

          console.log(`Moved data back from dummy tables to original tables for Material Numbers: ${materialNumbers}`);
        }
      }
    });
   
    this.on("Validate", async (req) => {
      const { ip_mara, ip_plant, ip_storage } = req.data;
      const validateErrors = [];
      const tx = cds.transaction(req);
      try {
        for (const entry of ip_mara) {
          const existingMaterialInMara = await tx.run(
            SELECT.one.from(Mara).where({ MATNR: entry.MATNR })
          );
          if (existingMaterialInMara) {
            validateErrors.push({
              matnr: entry.MATNR,
              errors: [
                {
                  message: `Material already exists`,
                },
              ],
            });
            continue;
          }

          const existingMaterialInDummy = await tx.run(
            SELECT.one.from(mara_dummy).where({ MATNR: entry.MATNR })
          );
          if (existingMaterialInDummy) {
            validateErrors.push({
              matnr: entry.MATNR,
              errors: [
                {
                  message: `Material already exists`,
                },
              ],
            });
            continue;
          }
          const existingMaterialInDraft = await tx.run(
            SELECT.one.from("litemdg.Mara.drafts").where({ MATNR: entry.MATNR })
          );
          if (existingMaterialInDraft) {
            validateErrors.push({
              matnr: entry.MATNR,
              errors: [
                {
                  message: `Material already exists `,
                },
              ],
            });
          }
        }
        await tx.commit();
      } catch (error) {
        await tx.rollback();
        console.error("Error during validation:", error);
        req.error(500, "Error during validation process");
      }
      req.reply({ validation_errors: validateErrors });
    });

    // this.on("ProcessExcel", async (req) => {
    //   const { ip_mara, ip_plant } = req.data;

    //   const tx = cds.transaction(req);
    //   try {
    //     await Promise.all(
    //       ip_mara.map((entry) => tx.run(INSERT.into(Mara).entries(entry)))
    //     );

    //     await Promise.all(
    //       ip_plant.map((plantEntry) =>
    //         tx.run(INSERT.into(plant).entries(plantEntry))
    //       )
    //     );

    //     await Promise.all(
    //       ip_plant.map(async (plantEntry) => {
    //         const material = await tx.run(
    //           SELECT.one.from(Mara).where({ MATNR: plantEntry.mat_plant_MATNR })
    //         );
    //         if (material) {
    //           await tx.run(
    //             UPDATE(plant)
    //               .set({ mat_plant_ID: material.ID })
    //               .where({ mat_plant_MATNR: plantEntry.mat_plant_MATNR })
    //           );
    //         }
    //       })
    //     );

    //     await tx.commit();
    //     return "Data uploaded and linkages created successfully!";
    //   } catch (error) {
    //     await tx.rollback();
    //     console.error("Error during data processing:", error);
    //     req.error(
    //       500,
    //       "Error during material or plant data insertion or linkage creation"
    //     );
    //   }
    // });

    this.on("ProcessExcel", async (req) => {
      const { ip_mara, ip_plant, ip_storage, ip_description } = req.data;
      const tx = cds.transaction(req);
      try {
        const maxRequest = await tx.run(
          SELECT.one
            .from("litemdg.Change_Request")
            .columns("REQUEST_NUMBER")
            .where("REQUEST_NUMBER IS NOT NULL")
            .orderBy({ REQUEST_NUMBER: "desc" })
        );
        let req_no =
          maxRequest && maxRequest.REQUEST_NUMBER !== undefined
            ? maxRequest.REQUEST_NUMBER + 1
            : 1;

        const result = await tx.run(
          SELECT.one
            .from("litemdg.mara_dummy")
            .columns(["MAX(MAX_NO) as MAX_NO"])
            .where({ REQUEST_NUMBER: req_no })
        );

        let max_no =
          result && result.MAX_NO !== undefined ? result.MAX_NO + 1 : 1;

        for (const entry of ip_mara) {
          entry.REQUEST_NUMBER = req_no;
          entry.MAX_NO = max_no;
          entry.Status = "Inactive";
        }

        await Promise.all(
          ip_mara.map((entry) => tx.run(INSERT.into(mara_dummy).entries(entry)))
        );

        const insertedMaraEntries = await tx.run(
          SELECT.from(mara_dummy).where({
            REQUEST_NUMBER: req_no,
            MAX_NO: max_no,
          })
        );

        await Promise.all(
          ip_plant.map(async (entry) => {
            const material = await tx.run(
              SELECT.one
                .from(mara_dummy)
                .where({ MATNR: entry.mat_plant_MATNR })
            );
            // const { mat_plant_MATNR, ...entryWithoutMATNR } = entry;
            if (material) {
              await tx.run(
                INSERT.into(Plant_dummy).entries({
                  ...entry,
                  mat_plant_ID: material.ID,
                })
              );
            }
          })
        );

        await Promise.all(
          ip_storage.map(async (entry) => {
            const plant = await tx.run(
              SELECT.one
                .from(Plant_dummy)
                .where({
                  WERKS_WERKS: entry.plant_WERKS_WERKS,
                  mat_plant_MATNR: entry.plant_mat_plant_MATNR,
                })
            );
            if (plant) {
              await tx.run(
                INSERT.into(Storage_dummy).entries({
                  ...entry,
                  plant_mat_plant_ID: plant.mat_plant_ID,
                })
              );
            } else {
              await tx.run(
                INSERT.into(Storage_dummy).entries({
                  ...entry,
                })
              );
            }
          })
        );

        await Promise.all(
          ip_description.map(async (entry) => {
            const material = await tx.run(
              SELECT.one.from(mara_dummy).where({ MATNR: entry.Material_MATNR })
            );
            if (material) {
              await tx.run(
                INSERT.into(Description_dummy).entries({
                  ...entry,
                  Material_ID: material.ID,
                })
              );
            }
          })
        );
        await tx.commit();
        req.reply({
          message: "Data uploaded successfully!",
          insertedMaraEntries,
        });
      } catch (error) {
        await tx.rollback();
        console.error("Error during data processing:", error);
        req.error(500, "Error during material or plant data insertion");
      }
    });

    this.on("Trigger_workflow", async (req) => {
      let number = 0;

      const { ip_mara, ip_plant, ip_storage, ip_description } = req.data;
      function replaceNull(value) {
        return value === null || value === undefined ? "" : value;
      }
      function replaceDec(value) {
        return value == null || value === undefined ? "0.000" : String(value);
      }
      function replaceInt(value) {
        return value == null || value === undefined ? "0" : String(value);
      }
      function replaceDec3(value) {
        return value == null || value === undefined
          ? "0.000"
          : value.toFixed(3);
      }
      const timestamp = new Date(req.timestamp);

      const creationDate =
        timestamp.getFullYear() +
        String(timestamp.getMonth() + 1).padStart(2, "0") + // Months are 0-indexed
        String(timestamp.getDate()).padStart(2, "0");

      const creationTime =
        String(timestamp.getHours()).padStart(2, "0") +
        String(timestamp.getMinutes()).padStart(2, "0") +
        String(timestamp.getSeconds()).padStart(2, "0");

      const maxRequest = await SELECT.one
        .from("litemdg.Change_Request")
        .columns("REQUEST_NUMBER")
        .where("REQUEST_NUMBER IS NOT NULL")
        .orderBy({ REQUEST_NUMBER: "desc" });

      let req_no =
        maxRequest && maxRequest.REQUEST_NUMBER !== undefined
          ? maxRequest.REQUEST_NUMBER + 1
          : 1;

      var payload = {
        definitionId:
          "eu10.bgsw-sdsc-coe-at1drpz8.changerequesttrigger.material_Governance_Process",
        context: {
          material: {
            ChangeRequest: {
              Change_Req_Number: req_no.toString(),
              Requested_By: req.user.attr.email,
              Creation_Date: creationDate,
              Creation_Time: creationTime,
              Request_Status: "To Be Approved",
              Multiple_Materials: "X",
              Type_Request: "MASS_CREATE",
              Description : "",
            },
            Material: [],
            to_Description: [],
            to_SalesDelivery: [],
            to_Plant: [],
            to_Storage_Location: [],
            to_Valuation: [],
          },
        },
      };

      // Loop through materialData and add to payload
      ip_mara.forEach(function (item) {
        payload.context.material.Material.push({
          Product: replaceNull(item.MATNR),
          BaseUnit: replaceNull(item.MEINS1_UOM),
          Division: replaceNull(item.SPART),
          NetWeight: replaceDec(item.NTGEW),
          WeightUnit: replaceNull(item.GEWEI),
          GrossWeight: replaceDec(item.BRGEW),
          ProductType: replaceNull(item.MTART),
          ProductGroup: replaceNull(item.MATKL),
          ProductOldID: replaceNull(item.BISMT),
          IndustrySector: replaceNull(item.MBRSH),
          ProductHierarchy: replaceNull(item.PRDHA),
          VolumeUnit: replaceNull(item.VOLEH_unit),
          MaterialVolume: replaceDec(item.VOLUM),
          CrossPlantStatus: replaceNull(item.MSTAE),
          ItemCategoryGroup: replaceNull(item.MTPOS_MARA),
          IsMarkedForDeletion: false,
          ProductStandardID: replaceNull(item.WRKST),
          ExternalProductGroup: replaceNull(item.EXTWG),
          MeasurementUnit: replaceNull(item.MEABM),
          ProductWidth: replaceDec(item.LAENG),
          ProductHeight: replaceDec(item.BREIT),
          ProductLength: replaceDec(item.HOEHE),
          ExpirationDate: replaceNull(item.SLED_BBD),
          TotalShelfLife: replaceNull(item.MHDHB),
          StorageConditions: replaceNull(item.RAUBE),
          MinRemainingShelfLife: replaceNull(item.MHDRZ),
          ShelfLifeExpirationDatePeriod: replaceNull(item.IPRKZ),
          TransportationGroup: replaceNull(item.TRAGR),
          PurchasingAcknProfile: replaceNull(item.EKWSL),
          QltyMgmtInProcmtIsActive: "",
        });
      });
      ip_description.forEach(function (item) {
        payload.context.material.to_Description.push({
          Product: replaceNull(item.Material_MATNR),
          LanguageID: item.code,
          Description: replaceNull(item.Description),
        });
      });

      ip_mara.forEach(function (item) {
        payload.context.material.to_SalesDelivery.push({
          Product: "",
          ProductSalesOrg: "",
          ProductDistributionChnl: "",
          RoundingProfile: "",
          IsMarkedForDeletion: false,
          ProductHierarchy: "",
          ItemCategoryGroup: "",
        });
      });

      ip_mara.forEach(function (item) {
        payload.context.material.to_Valuation.push({
          Product: "",
          ValuationArea: "",
          ValuationType: "",
          ValuationClass: "",
          PriceUnitQty: "",
          StandardPrice: "",
          Currency: "",
          CurrencyRole: "",
          MovingAveragePrice: "",
          ProductPriceControl: "",
          IsMarkedForDeletion: false,
        });
      });

      ip_plant.forEach(function (item) {
        payload.context.material.to_Plant.push({
          Product: replaceNull(item.mat_plant_MATNR),
          Plant: replaceNull(item.WERKS1_WERKS),
          MRPType: replaceNull(item.DISMM),
          ProfileCode: replaceNull(item.MMSTA),
          ABCIndicator: replaceNull(item.MAABC),
          ProfitCenter: replaceNull(item.PRCTR1_PRCTR),
          MRPResponsible: replaceNull(item.DISPO),
          ProcurementType: replaceNull(item.BESKZ),
          PurchasingGroup: replaceNull(item.EKGRP),
          IsMarkedForDeletion: false,
          FixedLotSizeQuantity: replaceInt(item.FXLOS),
          GoodsReceiptDuration: replaceNull(item.SCM_GRPRT),
          IsInternalBatchManaged: false,
          ProfileValidityStartDate: replaceNull(item.GSTRS),
          LoadingGroup: replaceNull(item.LADGR),
          AvailabilityCheckType: replaceNull(item.AVAILCHECK),
          Currency: "JPY",
          MRPGroup: replaceNull(item.DISGR),
          LotSizingProcedure: replaceNull(item.DISLS),
          MaximumLotSizeQuantity: replaceInt(item.FXLOS),
          MinimumLotSizeQuantity: replaceInt(item.FXLOS),
          ProductProcessingTime: replaceDec3(item.PLIFZ),
          CountryOfOrigin: replaceNull(item.HERKL),
        });
      });

      ip_storage.forEach(function (item) {
        payload.context.material.to_Storage_Location.push({
          Product: replaceNull(item.Materaial_MATNR),
          Plant: replaceNull(item.WERKS),
          StorageLocation: replaceNull(item.LGORT),
          StorageBin: replaceNull(item.LGPBE),
        });
      });

      console.log("payload:", payload);

      const WF_API = await cds.connect.to("sap_process_automation_service_user_access_New");
      const result = await WF_API.send('POST', '/workflow/rest/v1/workflow-instances', JSON.stringify(payload), {
        "Content-Type": "application/json"
      });

      console.log("result:",result);

      if (result.rootInstanceId){
      await INSERT.into("litemdg.Change_Request").entries({
        REQUEST_NUMBER: req_no,
        InstanceID: result.rootInstanceId,
        REQUEST_TYPE: "MASS_CREATE",
        Overall_status: "Open",
        Model: "Material",
        Requested_By: req.user.attr.email,
        Requested_Date: creationDate,
        Requested_Time: creationTime,
        Requested_on: timestamp,
      });

      for (const item of ip_mara) {
        await INSERT.into("litemdg.Change_Request_details").entries({
          Change_REQUEST_NUMBER: req_no,
          Object_ID: item.MATNR,
          Description: item.MAKT_MAKTX,
          Object_CUID: "",
          Overall_status: "Open",
        });
      }
      number = req_no;
      }

      return number;
    });
    this.on("SaveToDB", async (req) => {
      const { ip_req_no } = req.data;
      const tx = cds.transaction(req);
      let output = "Data saved to DB successfully!";

      try {
        const changeRequestDetails = await tx.run(
          SELECT.from("litemdg.Change_Request_details").where({
            Change_REQUEST_NUMBER: ip_req_no,
          })
        );

        if (changeRequestDetails.length > 0) {
          for (const detail of changeRequestDetails) {
            const { object_id } = detail;

            const maraDummyData = await tx.run(
              SELECT.from(mara_dummy).where({ MATNR: object_id })
            );

            const plantDummyData = await tx.run(
              SELECT.from(Plant_dummy).where({
                mat_plant_ID: maraDummyData[0].ID,
              })
            );

            const descriptionDummyData = await tx.run(
              SELECT.from(Description_dummy).where({
                Material_MATNR: maraDummyData[0].ID,
              })
            );

            //   plantDummyData.forEach(entry => {
            //     entry.mat_plant_MATNR = maraDummyData[0].MATNR;
            //  });

            let storageDummyData = [];

            if (plantDummyData.length > 0) {
              for (const plant of plantDummyData) {
                const storageData = await tx.run(
                  SELECT.from(Storage_dummy).where({
                    plant_mat_plant_ID: plant.mat_plant_ID,
                    plant_mat_plant_MATNR: plant.mat_plant_MATNR,
                    plant_WERKS_WERKS: plant.WERKS_WERKS,
                  })
                );

                if (storageData.length > 0) {
                  storageDummyData.push(...storageData);
                }
              }
            }

            let maraInserted = true;
            let plantInserted = true;
            let storageInserted = true;
            let descriptionInserted = true;

            if (maraDummyData.length > 0) {
              for (const entry of maraDummyData) {
                const {
                  MAX_NO,
                  REQUEST_NUMBER,
                  CREATION_TYPE,
                  ...cleanedEntry
                } = entry;
                const result = await tx.run(
                  INSERT.into(Mara).entries(cleanedEntry)
                );
                if (result.results.length != 1) {
                  maraInserted = false;
                  output = "Insertion Failed";
                  break;
                }
              }
            }

            if (plantDummyData.length > 0 && maraInserted) {
              for (const entry of plantDummyData) {
                const result = await tx.run(INSERT.into(plant).entries(entry));
                if (result.results.length != 1) {
                  plantInserted = false;
                  output = "Insertion Failed";
                  break;
                }
              }
            }

            if (descriptionDummyData.length > 0 && maraInserted) {
              for (const entry of descriptionDummyData) {
                const result = await tx.run(
                  INSERT.into(Description).entries(entry)
                );
                if (result.results.length != 1) {
                  descriptionInserted = false;
                  output = "Insertion Failed";
                  break;
                }
              }
            }

            if (storageDummyData.length > 0 && plantInserted) {
              for (const entry of storageDummyData) {
                const result = await tx.run(
                  INSERT.into(Storage_Location).entries(entry)
                );
                if (result.results.length != 1) {
                  storageInserted = false;
                  output = "Insertion Failed";
                  break;
                }
              }
            }

            if (
              maraInserted &&
              plantInserted &&
              storageInserted &&
              descriptionInserted
            ) {
              await tx.run(DELETE.from(mara_dummy).where({ MATNR: object_id }));
              await tx.run(
                DELETE.from(Plant_dummy).where({
                  mat_plant_ID: maraDummyData[0].ID,
                })
              );
              if (plantDummyData.length > 0) {
                for (const plant of plantDummyData) {
                  await tx.run(
                    DELETE.from(Storage_dummy).where({
                      plant_mat_plant_ID: plant.mat_plant_ID,
                      plant_mat_plant_MATNR: plant.mat_plant_MATNR,
                      plant_WERKS_WERKS: plant.WERKS_WERKS,
                    })
                  );
                }
              }
            }
          }
        }

        await tx.commit();
      } catch (error) {
        await tx.rollback();
        console.error("Error during data saving:", error);
        req.error(500, "Error during data saving to DB");
        output = "Error during data saving to DB";
      }
      return output;
    });
    this.on("FieldStatus", async (req) => {
      const { ip_type } = req.data;
      const Field_Properties = await SELECT.from(UI_Field_Properties);
      var result = [];
      for (const row of Field_Properties) {
        let required = true, visible = true, editable = true;
        if (ip_type === 'CREATE') {
          if (row.Create === 'R') {
            editable = false;
            required = false;
          }
          else if (row.Create === 'H') {
            visible = false;
            required = false;
          }
          else if (row.Create === 'E') {
            required = false;
          }
        }
        else if (ip_type === 'CHANGE') {
          if (row.Change === 'R') {
            editable = false;
            required = false;
          }
          else if (row.Change === 'H') {
            visible = false;
            required = false;
          }
          else if (row.Create === 'E') {
            required = false;
          }
        }
        result.push({
          Table: row.Table,
          Field: row.Field_Name,
          Required: required,
          Visble: visible,
          Editable: editable
        });
      }
      return result;
    });
    this.on("InsertMaterial", async (req) => {

      const { ip_MaterialID,ip_NewMaterial  } = req.data;

      const ip_Matnr = ip_MaterialID;
      const ip_NewMatnr = ip_NewMaterial;

      const tx = cds.transaction(req);

      try {
        const materialData = await tx.run(
          SELECT.one.from(Mara).where({ ID: ip_Matnr })
        );

        if (!materialData) {
          req.error(500, `Material ${ip_Matnr} not found.`);
        }
        const gen_ID = await generateCUID()
        materialData.ID = gen_ID;
        materialData.MATNR = ip_NewMatnr;

        const draft_data = {
          creationdatetime: new Date().toISOString(),
          createdbyuser: 'anonymous',
          draftiscreatedbyme: true,
          lastchangedatetime: new Date().toISOString(),
          lastchangedbyuser: 'anonymous',
          inprocessbyuser: 'anonymous',
          draftisprocessedbyme: true
        };

        draft_data.draftuuid = await generateCUID()


        await tx.run(INSERT.into("draft_draftadministrativedata").entries(draft_data));

        materialData.draftadministrativedata_draftuuid = draft_data.draftuuid

        await tx.run(
          INSERT.into("litemdg.mara.drafts").entries(materialData)
        );


        const newmaterialData = await tx.run(
          SELECT.one.from("litemdg.mara.drafts").where({ MATNR: ip_NewMatnr })
        );


        const newMaterialID = newmaterialData.ID;

        const plantData = await tx.run(SELECT.from(plant).where({ mat_plant_ID: ip_Matnr }));
        const salesDeliveryData = await tx.run(SELECT.from(Sales_Delivery).where({ Material_ID: ip_Matnr }));
        const valuationData = await tx.run(SELECT.from(Valuation).where({ Material_ID: ip_Matnr }));
        const descriptionData = await tx.run(SELECT.from(Description).where({ Material_ID: ip_Matnr }));
        const storageData = await tx.run(SELECT.from(Storage_Location).where({ plant_mat_plant_ID: ip_Matnr }));

        if (plantData.length) {
          const updatedPlantData = plantData.map(({ mat_plant_ID, ...rest }) => ({
            ...rest,
            mat_plant_MATNR: ip_NewMatnr,
            mat_plant_ID: gen_ID,
            draftadministrativedata_draftuuid: draft_data.draftuuid
          }));

          await tx.run(INSERT.into('litemdg.plant.drafts').entries(updatedPlantData));
        }

        if (salesDeliveryData.length) {
          const updatedSalesDeliveryData = salesDeliveryData.map(({ Material_ID, ...rest }) => ({
            ...rest,
            Material_MATNR: ip_NewMatnr,
            Material_ID: gen_ID,
            draftadministrativedata_draftuuid: draft_data.draftuuid
          }));

          await tx.run(INSERT.into('litemdg.sales.delivery.drafts').entries(updatedSalesDeliveryData));
        }

        if (valuationData.length) {
          const updatedValuationData = valuationData.map(({ Material_ID, ...rest }) => ({
            ...rest,
            Material_MATNR: ip_NewMatnr,
            Material_ID: gen_ID,
            draftadministrativedata_draftuuid: draft_data.draftuuid
          }));

          await tx.run(INSERT.into('litemdg.valuation.drafts').entries(updatedValuationData));
        }

        if (descriptionData.length) {
          const updatedDescriptionData = descriptionData.map(({ Material_ID, ...rest }) => ({
            ...rest,
            Material_MATNR: ip_NewMatnr,
            Material_ID: gen_ID,
            draftadministrativedata_draftuuid: draft_data.draftuuid
          }));

          await tx.run(INSERT.into('litemdg.description.drafts').entries(updatedDescriptionData));
        }

        if (storageData.length) {
          const updatedStorageData = storageData.map(({ plant_mat_plant_ID, ...rest }) => ({
            ...rest,
            plant_mat_plant_ID: gen_ID,
            plant_mat_plant_MATNR: ip_NewMatnr,
            draftadministrativedata_draftuuid: draft_data.draftuuid
          }));

          await tx.run(INSERT.into('litemdg.storage.loaction.drafts').entries(updatedStorageData));
        }
        await tx.commit()
        return `Material ${ip_NewMatnr} successfully inserted into drafts.`;
      } catch (error) {
        console.error("Error in InsertMaterial action:", error);
        req.error(500, "Failed to insert material into drafts.");
      }

    });

    return super.init();
  }
};

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
          BaseUnit: reqData.MEINS_UOM || "",
          Division: reqData.SPART || "",
          NetWeight: reqData.NTGEW ? reqData.NTGEW.toString() : "0.000",
          WeightUnit: reqData.GEWEI || "",
          GrossWeight: reqData.BRGEW ? reqData.BRGEW.toString() : "0.000",
          ProductType: reqData.MTART_Material_type || "",
          ProductGroup: reqData.MATKL || "",
          ProductOldID: reqData.BISMT || "",
          IndustrySector: reqData.MBRSH || "",
          ProductHierarchy: reqData.PRDHA || "",
          VolumeUnit: reqData.VOLEH_unit || "",
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
              BaseUnit: reqData.MEINS_UOM || "",
              VolumeUnit: reqData.VOLEH_unit || "",
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
        Plant: plant.WERKS1_WERKS || "",
        MRPType: plant.DISMM || "",
        ProfileCode: "40", // Placeholder value
        ABCIndicator: plant.MAABC || "",
        ProfitCenter: plant.PRCTR1_PRCTR || "",
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
          Plant: plant.WERKS1_WERKS || "",
        },
        to_ProductSupplyPlanning: {
          Plant: plant.WERKS1_WERKS || "",
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
          Plant: plant.WERKS1_WERKS || "",
          Product: reqData.MATNR || "",
          ProductProcessingTime: plant.BEARZ ? plant.BEARZ.toString() : "0",
        },
        to_ProdPlantInternationalTrade: {
          Plant: plant.WERKS1_WERKS || "",
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
            Plant: plant.WERKS1_WERKS || "",
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

async function generateCUID() {
  return uuidv4().slice(0, 36); 
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

async function genid(req) {
  console.log("in");
}
