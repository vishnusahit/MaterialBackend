const cds = require("@sap/cds");
const { v4: uuidv4 } = require('uuid');
const { CallEntity,Move_To_Dummy,Rules_Derivation,Rules_default,Rules_validation,createWorkflowInstance,generateCUID} = require('./functions')
const { getKeyPredicateDynamic,
  logChange,
  processComposedEntities,
  fetchBeforeChildren } = require('./ChangeTrackingHandler')
const {fnOpenChangeRequestCount,fnMyInboxCount} = require("./tileCountFuncionHandler");
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
      Sales_dummy,
      Value_ListAPI,
      Value_List,
      ChangeLog,
      EntityItems
    } = this.entities;
    console.log(Object.keys(this.entities));
    const srv = this;

    //Anupam : For Open Change Requests
  this.on('getOpenChangeRequestCount', async (req) => {
      return fnOpenChangeRequestCount(req);
  });
  this.on('getInboxPendingRequestcount', async (req) => {
    return fnMyInboxCount(req);
});
  
    srv.after(["CREATE"], "Mara.drafts", async (req) => {

      const { ID, MATNR } = req;
      const entity = "Material"

      req.Status = "Inactive";
      const maraDummyData = {
        ID: ID,
        MATNR: MATNR,
        CREATION_TYPE: "SINGLE",
      };

      await INSERT.into("litemdg.mara_dummy").entries(maraDummyData);

      await UPDATE("litemdg.mara.drafts")
        .set({ Status: "Inactive" })
        .where({ ID: ID });

    });
    srv.before(["CREATE"], "Mara.drafts", async(req) => {
      const { ID, MATNR } = req.data;
      const existingRecord = await SELECT.one.from(Mara).where({ MATNR : MATNR });
      const existingRecord_dummy = await SELECT.one.from("litemdg.mara.drafts").where({ MATNR : MATNR });
      if (!existingRecord && !existingRecord_dummy) {
      const entity = "MARA";
      console.log("request data: "+ req);
      await Rules_default(req,srv,entity,ID)
      }
      else{
        req.error(500,"Material Number Already exists");
      }
    });
    srv.before(["DELETE"], "Mara.drafts", async (req) => {
      const { ID } = req.data;
      await DELETE.from("litemdg.mara_dummy").where({ ID: ID });
    });
    srv.after(["UPDATE"], "Mara.drafts", async (req) => {
      const { ID, MAKT_MAKTX, MATNR } = req;
      if (MAKT_MAKTX || MAKT_MAKTX === null) {
        const draft_UUID = await SELECT.from("litemdg.Mara.drafts").where({
          ID: ID,
        });
        let DescriptionEntry = {
          Material_MATNR: MATNR,
          Material_ID: ID,
          code: "EN",
          Description: MAKT_MAKTX,
          draftadministrativedata_draftuuid:
            draft_UUID[0].DraftAdministrativeData_DraftUUID,
        };

        // await UPSERT.into("litemdg.description.drafts")
        //   .entries(DescriptionEntry)
        //   .columns("Description");

        const existingEntry = await SELECT.one
          .from("litemdg.description.drafts")
          .where({ Material_ID: ID, Material_MATNR: MATNR, code: "EN" });

        if (existingEntry) {
          await UPDATE("litemdg.description.drafts")
            .set({ Description: MAKT_MAKTX,draftadministrativedata_draftuuid:draft_UUID[0].DraftAdministrativeData_DraftUUID })
            .where({ Material_ID: ID, Material_MATNR: MATNR, code: "EN" });
        } else {
          await INSERT.into("litemdg.description.drafts").entries(
            DescriptionEntry
          );
        }
      }
    });
    // srv.after(['DELETE'],Mara, async(req) => {
    //   const { ID } =  req
    //   await DELETE.from(mara_dummy).where({ ID: ID });
    //   await DELETE.from(Plant_dummy).where({ mat_plant_ID: ID });
    //   await DELETE.from(Storage_dummy).where({ plant_mat_plant_ID : ID  });
    //   await DELETE.from(Sales_dummy).where({ Material_ID: { in: ID } });
    //   await DELETE.from(Valuation_dummy).where({  Material_ID: { in: ID } });
    //   await DELETE.from(Description_dummy).where({  Material_ID: { in: ID } });
    // })
    srv.before(["CREATE"], "plant.drafts", async (req) => {
      const { mat_plant_ID } = req.data;
      const ID = mat_plant_ID;
      const entity = "MARC" 
      await Rules_default(req,srv,entity,ID)
    });
    srv.before(["CREATE"], "Sales_Delivery.drafts", async (req) => {
      const { Material_ID } = req.data;
      const ID = Material_ID;
      const entity = "Sales" 
      await Rules_default(req,srv,entity,ID)
    });
    srv.before(["CREATE"], "Valuation.drafts", async (req) => {
      const { Material_ID } = req.data;
      const ID = Material_ID;
      const entity = "Valuation" 
      await Rules_default(req,srv,entity,ID)
    });
    srv.before(["CREATE"], "Storage_Location.drafts", async (req) => {
      const { plant_mat_plant_id } = req.data;
      const ID = plant_mat_plant_id;
      const entity = "StorageLocation" 
      await Rules_default(req,srv,entity,ID)
    });

    srv.before(["UPDATE"], "plant.drafts", async (req) => {
      const { mat_plant_ID } = req.data;
      const ID = mat_plant_ID;
      const entity = "MARC" 
      await Rules_Derivation(req,srv,entity,ID)
    });
    srv.before(["UPDATE"], "Mara.drafts", async (req) => {
      const { ID } = req.data;
      // const ID = mat_plant_ID;
      const entity = "MARA" 
      await Rules_Derivation(req,srv,entity,ID)
    });
    srv.before(["UPDATE"], "Sales_Delivery.drafts", async (req) => {
      const { Material_ID } = req.data;
      const ID = Material_ID;
      const entity = "Sales" 
      await Rules_Derivation(req,srv,entity,ID)
    });
    srv.before(["UPDATE"], "Valuation.drafts", async (req) => {
      const { Material_ID } = req.data;
      const ID = Material_ID;
      const entity = "Valuation" 
      await Rules_Derivation(req,srv,entity,ID)
    });
    srv.before(["UPDATE"], "Storage_Location.drafts", async (req) => {
      const { plant_mat_plant_id } = req.data;
      const ID = plant_mat_plant_id;
      const entity = "StorageLocation" 
      await Rules_Derivation(req,srv,entity,ID)
    });

    srv.after(["EDIT"], Mara, async (req) => {

      const { ID } = req;
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
    });

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
          const data = req.data
          const parentEntity = req.target;
          const parentKey = getKeyPredicateDynamic(parentEntity.name, req.data);
          const formattedKey = parentKey.replaceAll('|', ',');
          const changedBy = req.user.id;
          const changedAt = new Date();
          await Rules_validation(req,srv);
          if (req.errors) throw req.reject()

          await DELETE.from("litemdg.mara_dummy").where({ ID: req.data.ID });
          // await Move_To_Dummy(req,srv);
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
                Description : req.data.Request_Desc,

              });

              await INSERT.into("litemdg.Change_Request_details").entries({
                Change_REQUEST_NUMBER: req_no,
                Object_ID: req.data.MATNR,
                Description: req.data.MAKT_MAKTX,
                Object_CUID: req.data.ID,
                Material_type: req.data.MTART,
                Overall_status: "Open",
                Material_type : req.data.MTART

              });
              await logChange(
                "CREATE",
                parentEntity.name,
                parentKey,
                changedAt,
                changedBy,
                null,
                null,
                null,
                req_no,
                ChangeLog,
                EntityItems,
                formattedKey
              );
    
              await processComposedEntities(
                parentEntity.name,
                data,
                parentKey,
                "CREATE",
                changedAt,
                changedBy,
                EntityItems,
                ChangeLog,
                req_no,
                formattedKey
              );

              req.notify(`Request Number#${req_no} submitted for approval`);
              
            }
        }
      }
      if (req.event === "UPDATE") {
        await Rules_validation(req,srv)
       
        const parentEntity = req.target;
        const parentKey = getKeyPredicateDynamic(parentEntity.name, req.data);

        const formattedKey = parentKey.replaceAll('|', ',');

        let beforeDataPromise;

        const whereClause = {};
        let hasKeys = false;
        if (parentEntity.keys) {
          for (const key of Object.keys(parentEntity.keys)) {
            if (req.data[key] !== undefined) {
              whereClause[key] = req.data[key];
              hasKeys = true;
            }
          }
        }
        if (hasKeys) {
          beforeDataPromise = SELECT.one(parentEntity.name).where(whereClause); //  Use whereClause
        } else {
          beforeDataPromise = SELECT.one(parentEntity.name).where(req.data);
        }
        const changedBy = req.user.id;
        const changedAt = new Date();

        const beforeData = await beforeDataPromise;
        req._beforeData = beforeData;
        
        if (req.errors) throw req.reject()
        req.data.Status = 'Inactive'
        var Type_Request = 'CHANGE'
        // await Move_To_Dummy(req,srv);
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
            Description : req.data.Request_Desc,

          });

          await INSERT.into("litemdg.Change_Request_details").entries({
            Change_REQUEST_NUMBER: req_no,
            Object_ID: req.data.MATNR,
            Description: req.data.MAKT_MAKTX,
            Object_CUID: req.data.ID,
            Material_type : req.data.MTART,
            Overall_status: "Open",
          });

          
          if (beforeData) {
            for (const field in req.data) {
              if (
                parentEntity.elements[field] &&
                !parentEntity.elements[field].isAssociation &&
                !parentEntity.elements[field].isComposition &&
                beforeData[field] !== req.data[field]
              ) {
                console.log("comparing in update");
                await logChange(
                  "UPDATE",
                  parentEntity.name,
                  parentKey,
                  changedAt,
                  changedBy,
                  field,
                  beforeData[field],
                  req.data[field],
                  req_no,
                  ChangeLog,
                  EntityItems,
                  formattedKey
                );
              }
            }
          }
          console.log("after logging in");
          await processComposedEntities(
            parentEntity.name,
            req.data,
            getKeyPredicateDynamic(parentEntity.name, req.data),
            "UPDATE",
            changedAt,
            changedBy,
            EntityItems,
            ChangeLog,
            req_no,
            formattedKey
          );
          req.notify(`Request Number#${req_no} submitted for approval`);
          
        }
      }

    });

    srv.before(["UPDATE"], Change_Request, async (req) => {
      const { REQUEST_NUMBER } = req.data;

      if (req.data.Overall_status !== undefined && req.data.Overall_status !== null) {

        const changeRequestData = await SELECT.one
          .from(Change_Request)
          .where({ REQUEST_NUMBER: REQUEST_NUMBER });

        if (!changeRequestData) {
          req.error(500, "Request number is not yet created")
          return;
        };

        const materialData = await SELECT
          .from(Change_Request_Details)
          .where({ Change_REQUEST_NUMBER: changeRequestData.REQUEST_NUMBER });

        const timestamp = new Date(req.timestamp);

        const creationDate =
            timestamp.getFullYear() +
            String(timestamp.getMonth() + 1).padStart(2, "0") +
            String(timestamp.getDate()).padStart(2, "0");
    
        const creationTime =
            String(timestamp.getHours()).padStart(2, "0") +
            String(timestamp.getMinutes()).padStart(2, "0") +
            String(timestamp.getSeconds()).padStart(2, "0");

        // if (!materialData || !materialData.Object_ID) return;

        const materialNumbers = materialData.map((entry) => entry.Object_ID);


        if (req.data.Overall_status === "Approved" && (changeRequestData.REQUEST_TYPE === "CREATE" || changeRequestData.REQUEST_TYPE === "MASS_CREATE")) {
          await UPDATE(Mara)
            .set({ Status: "Active" })
            .where({ MATNR: { in: materialNumbers } });

          await UPDATE(Change_Request_Details)
            .set({ Overall_status: "Approved" })
            .where({ Change_REQUEST_NUMBER: changeRequestData.REQUEST_NUMBER });

          await UPDATE(Change_Request)
            .set({ Overall_status: "Approved",
                   Completed_On  : timestamp,
                   Approved_date : creationDate,
                   Approved_Time : creationTime
                })
            .where({ REQUEST_NUMBER: REQUEST_NUMBER });

          // await DELETE.from(mara_dummy).where({ MATNR: { in: materialNumbers } });
          // await DELETE.from(Plant_dummy).where({ mat_plant_MATNR: { in: materialNumbers } });
          // await DELETE.from(Storage_dummy).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          // await DELETE.from(Sales_dummy).where({ Material_MATNR: { in: materialNumbers } });
          // await DELETE.from(Valuation_dummy).where({ Material_MATNR: { in: materialNumbers } });
          // await DELETE.from(Description_dummy).where({ Material_MATNR: { in: materialNumbers } });

          console.log(
            `Updated Mara status to Active for Material Number: ${materialNumbers.join(', ')}`
          );
        }
        else if (req.data.Overall_status === "Rejected" && (changeRequestData.REQUEST_TYPE === "CREATE" || changeRequestData.REQUEST_TYPE === "MASS_CREATE")) {
          await DELETE.from(Mara).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(plant).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_Location).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_Delivery).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description).where({ Material_MATNR: { in: materialNumbers } });

          // await DELETE.from(mara_dummy).where({ MATNR: { in: materialNumbers } });
          // await DELETE.from(Plant_dummy).where({ mat_plant_MATNR: { in: materialNumbers } });
          // await DELETE.from(Storage_dummy).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          // await DELETE.from(Sales_dummy).where({ Material_MATNR: { in: materialNumbers } });
          // await DELETE.from(Valuation_dummy).where({ Material_MATNR: { in: materialNumbers } });
          // await DELETE.from(Description_dummy).where({ Material_MATNR: { in: materialNumbers } });

          await UPDATE(Change_Request_Details)
            .set({ Overall_status: "Rejected" })
            .where({ Change_REQUEST_NUMBER: REQUEST_NUMBER })

          await UPDATE(Change_Request)
            .set({ Overall_status: "Rejected" })
            .where({ REQUEST_NUMBER: REQUEST_NUMBER })

          console.log(
            `Deleted entry from mara_staging for Material Number: ${materialNumbers.join(', ')}`
          );
        }
        else if (req.data.Overall_status === "Approved" && changeRequestData.REQUEST_TYPE === "CHANGE")  {

          await UPDATE(Mara)
            .set({ Status: "Active" })
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

          console.log(`Deleted entries from all dummy tables for Material Numbers: ${materialNumbers.join(', ')}`);

        }
        else if (req.data.Overall_status === "Rejected" && changeRequestData.REQUEST_TYPE === "CHANGE") {

          await DELETE.from(Mara).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(plant).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_Location).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_Delivery).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description).where({ Material_MATNR: { in: materialNumbers } });

          console.log(`Deleted entries from original tables for Material Numbers: ${materialNumbers.join(', ')}`);


          const maraData = await SELECT.from(mara_dummy).where({ MATNR: { in: materialNumbers } });

          // if (maraData.length) await INSERT.into(Mara).entries(maraData);
          if (maraData.length) {
            const filteredMaraData = maraData.map(({ REQUEST_NUMBER,MAX_NO,CREATION_TYPE, ...rest }) => ({
              ...rest,
              Status: "Inactive"
          }));
            await INSERT.into(Mara).entries(filteredMaraData);
        }

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

          console.log(`Moved data back from dummy tables to original tables for Material Numbers: ${materialNumbers.join(', ')}`);

          await DELETE.from(mara_dummy).where({ MATNR: { in: materialNumbers } });
          await DELETE.from(Plant_dummy).where({ mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Storage_dummy).where({ plant_mat_plant_MATNR: { in: materialNumbers } });
          await DELETE.from(Sales_dummy).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Valuation_dummy).where({ Material_MATNR: { in: materialNumbers } });
          await DELETE.from(Description_dummy).where({ Material_MATNR: { in: materialNumbers } });
          console.log(`Deleted entries from dummy tables after restoring data for Material Numbers: ${materialNumbers}`);
        }
      } 
    });

    srv.on(["READ"], Value_ListAPI, async (req) =>{

      const conn = await cds.connect.to('ZSRV_LITEMDG_VALUEHELP_API_SRV');

      const result = await conn.run(
        SELECT.from(Value_ListAPI)
          .columns(['Value', 'Description', 'Key', 'Datamodel'])
           .where({Key:req.data.Key}) 
      );
      console.log(result);
      

      if (result.length > 0) {
        for (const entry of result) {
          
          const exists = await SELECT.one.from(Value_List).where({
            Value: entry.Value,
            Fixed_Type: entry.Key 
          });

          if (!exists) {
            await INSERT.into(Value_List).entries({
              Value: entry.Value,
              Description: entry.Description,
              Fixed_Type: entry.Key
            });
          }
        }
      }
    })

    this.on('get_ValueList',async(req) => {
      const { Key } = req.data;
      var response = 'Inserted' ;
      const conn = await cds.connect.to('ZSRV_LITEMDG_VALUEHELP_API_SRV');
      
      const result = await conn.run(
        SELECT.from(Value_ListAPI)
          .columns(['Value', 'Description', 'Key', 'Datamodel'])
           .where({Key: Key}) 
      );
      console.log(result);
      
      

      if (result.length > 0) {
        for (const entry of result) {
          
          const exists = await SELECT.one.from(Value_List).where({
            Value: entry.Value,
            Fixed_Type: entry.Key 
          });

          if (!exists) {
            await INSERT.into(Value_List).entries({
              Value: entry.Value,
              Description: entry.Description,
              Fixed_Type: entry.Key
            });
          }
        }
    

      }
      if (req.errors){
        if(result.length > 0){
        response = "Insertion Failed";
       }
      }
      else if(result.length === 0){
        response = "Data not found"
      }
     return response;

    })
   
    this.on("Validate", async (req) => {
      const { ip_mara, ip_plant, ip_storage, ip_type, ip_Entity } = req.data;
      const validateErrors = [];
      const tx = cds.transaction(req);
      try {
        if (ip_type === 'CREATE'){
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
      }
      else if(ip_type === 'UPDATE'){
        switch (ip_Entity) {
          case 'Material':
            for (const entry of ip_mara) {
              const existingMaterialInMara = await tx.run(
                SELECT.one.from(Mara).where({ MATNR: entry.MATNR })
              );
              if (!existingMaterialInMara) {
                validateErrors.push({
                  matnr: entry.MATNR,
                  errors: [
                    {
                      message: `Material doesn't exists`,
                    },
                  ],
                });
                continue;
              }
              if (existingMaterialInMara.Status === 'Inactive') {
                validateErrors.push({
                  matnr: entry.MATNR,
                  errors: [
                    {
                      message: `Material is Inactive`,
                    },
                  ],
                });
                continue;
              }
            }
            break;
          case 'Plant':
            for (const entry of ip_plant) {
              const plantExists = await tx.run(
                SELECT.one.from(plant).where({ mat_plant_MATNR: entry.mat_plant_MATNR , WERKS : entry.WERKS })
              );
              if (!plantExists) {
                validateErrors.push({
                  matnr: entry.mat_plant_MATNR+'|'+entry.WERKS,
                  errors: [
                    {
                      message: `Plant doesn't exists`,
                    },
                  ],
                });
                continue;
              }
              else if(plantExists){
                const existingMaterialInMara = await tx.run(
                SELECT.one.from(Mara).where({ MATNR: entry.mat_plant_MATNR })
                );
                if (existingMaterialInMara.Status === 'Inactive') {
                  validateErrors.push({
                    matnr:entry.mat_plant_MATNR+'|'+entry.WERKS ,
                    errors: [
                      {
                        message: `Material is Inactive`,
                      },
                    ],
                  });
                  continue;
                }
              }
            }

            break;
          case 'Storage Location':
            for (const entry of ip_storage) {
              const LocationExists = await tx.run(
                SELECT.one.from(Storage_Location).where({ plant_mat_plant_MATNR: entry.plant_mat_plant_MATNR , plant_WERKS : entry.plant_WERKS, LGORT : entry.LGORT })
              );
              if (!LocationExists) {
                validateErrors.push({
                  matnr: entry.entry.plant_mat_plant_MATNR+'|'+entry.plant_WERKS+'|'+entry.LGORT,
                  errors: [
                    {
                      message: `Storage Location doesn't exists`,
                    },
                  ],
                });
                continue;
              }
              else if(LocationExists){
                const existingMaterialInMara = await tx.run(
                SELECT.one.from(Mara).where({ MATNR: entry.plant_mat_plant_MATNR })
                );
                if (existingMaterialInMara.Status === 'Inactive') {
                  validateErrors.push({
                    matnr:entry.entry.plant_mat_plant_MATNR+'|'+entry.plant_WERKS+'|'+entry.LGORT,
                    errors: [
                      {
                        message: `Material is Inactive`,
                      },
                    ],
                  });
                  continue;
                }
              }
            }

            break;
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
      const { ip_mara, ip_plant, ip_storage, ip_description, ip_type, ip_Entity } = req.data;
      var insertedMaraEntries;
      const seen = new Set();
      const parentRecords = [];
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
        if (ip_type === 'CREATE') {
          for (const entry of ip_mara) {
            entry.REQUEST_NUMBER = req_no;
            entry.MAX_NO = max_no;
            entry.CREATION_TYPE = 'MASS';
            entry.Status = "Open";
          }

          await Promise.all(
            ip_mara.map((entry) => tx.run(INSERT.into(mara_dummy).entries(entry)))
          );

          insertedMaraEntries = await tx.run(
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
                    WERKS: entry.plant_WERKS,
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
        }
        else if (ip_type === 'UPDATE') {
          const insertedMatnrs = new Set();
          switch (ip_Entity) {
            case 'Material':
              for (const entry of ip_mara) {
                const original = await tx.run(
                  SELECT.one.from(Mara).where({ MATNR: entry.MATNR })
                );
                if (original) {
                  original.REQUEST_NUMBER = req_no;
                  original.MAX_NO = max_no;
                  original.CREATION_TYPE = 'MASS UPDATE';
                  original.Status = 'Open';
                  await tx.run(
                    INSERT.into(mara_dummy).entries(original)
                  );
                }
                await tx.run(
                  UPDATE(mara_dummy)
                    .set(entry)
                    .where({
                      REQUEST_NUMBER: req_no,
                      MAX_NO: max_no,
                      MATNR: entry.MATNR,
                    })
                );
              }
              insertedMaraEntries = await tx.run(
                SELECT.from(mara_dummy).where({
                  REQUEST_NUMBER: req_no,
                  MAX_NO: max_no,
                })
              );
              break;
            case 'Plant':
              for (const entry of ip_plant) {
                if (!insertedMatnrs.has(entry.mat_plant_MATNR)) {
                  const original_mara = await tx.run(
                    SELECT.one.from(Mara).where({ MATNR: entry.mat_plant_MATNR })
                  );
                  if (original_mara) {
                    original_mara.REQUEST_NUMBER = req_no;
                    original_mara.MAX_NO = max_no;
                    original_mara.CREATION_TYPE = 'MASS UPDATE';
                    original_mara.Status = 'Open';
                    await tx.run(
                      INSERT.into(mara_dummy).entries(original_mara)
                    );
                    insertedMatnrs.add(entry.mat_plant_MATNR);
                  }
                }
                const original = await tx.run(
                  SELECT.one.from(plant).where({
                    mat_plant_MATNR: entry.mat_plant_MATNR,
                    WERKS: entry.WERKS,
                  })
                );
                if (original) {
                  await tx.run(
                    INSERT.into(Plant_dummy).entries(original)
                  );
                }
                await tx.run(
                  UPDATE(Plant_dummy)
                    .set(entry)
                    .where({
                      mat_plant_MATNR: entry.mat_plant_MATNR,
                      WERKS: entry.WERKS,
                    })
                );
                const parent = await tx.run(
                  SELECT.one.from(mara_dummy).where({
                    MATNR: entry.mat_plant_MATNR
                  })
                );

                if (parent && !seen.has(parent.MATNR)) {
                  parentRecords.push(parent);
                  seen.add(parent.MATNR);
                }

              }
              insertedMaraEntries = parentRecords;
              break;
            case 'Storage Location':
              for (const entry of ip_storage) {
                if (!insertedMatnrs.has(entry.plant_mat_plant_MATNR)) {
                  const original_mara = await tx.run(
                    SELECT.one.from(Mara).where({ MATNR: entry.plant_mat_plant_MATNR })
                  );
                  if (original_mara) {
                    original_mara.REQUEST_NUMBER = req_no;
                    original_mara.MAX_NO = max_no;
                    original_mara.CREATION_TYPE = 'MASS UPDATE';
                    original_mara.Status = 'Open';
                    await tx.run(
                      INSERT.into(mara_dummy).entries(original_mara)
                    );
                    insertedMatnrs.add(entry.plant_mat_plant_MATNR); 
                  }
                 }
                const original = await tx.run(
                  SELECT.one.from(Storage_Location).where({
                    LGORT: entry.LGORT,
                    plant_mat_plant_MATNR: entry.plant_mat_plant_MATNR,
                    plant_WERKS: entry.plant_WERKS,
                  })
                );
                if (original) {
                  await tx.run(
                    INSERT.into(Storage_dummy).entries(original)
                  );
                }
                await tx.run(
                  UPDATE(Storage_dummy)
                    .set(entry)
                    .where({
                      LGORT: entry.LGORT,
                      plant_mat_plant_MATNR: entry.plant_mat_plant_MATNR,
                      plant_WERKS: entry.plant_WERKS,
                    })
                );
                const parent = await tx.run(
                  SELECT.one.from(mara_dummy).where({
                    MATNR: entry.plant_mat_plant_MATNR
                  })
                );

                if (parent && !seen.has(parent.MATNR)) {
                  parentRecords.push(parent);
                  seen.add(parent.MATNR);
                }

              }
              insertedMaraEntries = parentRecords;
              break;
            case 'Description':
              for (const entry of ip_description) {
                if (!insertedMatnrs.has(entry.Material_MATNR)) {
                  const original_mara = await tx.run(
                    SELECT.one.from(Mara).where({ MATNR: entry.Material_MATNR })
                  );
                  if (original_mara) {
                    original_mara.REQUEST_NUMBER = req_no;
                    original_mara.MAX_NO = max_no;
                    original_mara.CREATION_TYPE = 'MASS UPDATE';
                    original_mara.status = 'Open';
                    await tx.run(
                      INSERT.into(mara_dummy).entries(original_mara)
                    );
                    insertedMatnrs.add(entry.Material_MATNR); 
                  }
                 }
                const original = await tx.run(
                  SELECT.one.from(Description).where({
                    Material_MATNR: entry.Material_MATNR,
                    code: entry.code,
                  })
                );
                if (original) {
                  await tx.run(
                    INSERT.into(Description_dummy).entries(original)
                  );
                }

                await tx.run(
                  UPDATE(Description_dummy)
                    .set(entry)
                    .where({
                      Material_MATNR: entry.Material_MATNR,
                      code: entry.code,
                    })
                );
                const parent = await tx.run(
                  SELECT.one.from(mara_dummy).where({
                    MATNR: entry.Material_MATNR
                  })
                );

                if (parent && !seen.has(parent.MATNR)) {
                  parentRecords.push(parent);
                  seen.add(parent.MATNR);
                }

              }
              insertedMaraEntries = parentRecords;
              break;
          }
        }
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

      const { ip_mara, ip_plant, ip_storage, ip_description, ip_Entity, ip_type } = req.data;
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

      
      var desc = ip_mara[0].Request_Desc
      if (ip_type === 'CREATE'){
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
              Description : desc,
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
          BaseUnit: replaceNull(item.MEINS),
          Division: replaceNull(item.SPART),
          NetWeight: replaceDec(item.NTGEW),
          WeightUnit: replaceNull(item.GEWEI),
          GrossWeight: replaceDec(item.BRGEW),
          ProductType: replaceNull(item.MTART),
          ProductGroup: replaceNull(item.MATKL),
          ProductOldID: replaceNull(item.BISMT),
          IndustrySector: replaceNull(item.MBRSH),
          ProductHierarchy: replaceNull(item.PRDHA),
          VolumeUnit: replaceNull(item.VOLEH),
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
          Plant: replaceNull(item.WERKS),
          MRPType: replaceNull(item.DISMM),
          ProfileCode: replaceNull(item.MMSTA),
          ABCIndicator: replaceNull(item.MAABC),
          ProfitCenter: replaceNull(item.PRCTR),
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
          Product: replaceNull(item.Material_MATNR),
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
        Description : req.data.Request_Desc,
      });

      for (const item of ip_mara) {
        await INSERT.into("litemdg.Change_Request_details").entries({
          Change_REQUEST_NUMBER: req_no,
          Object_ID: item.MATNR,
          Description: item.MAKT_MAKTX,
          Object_CUID: "",
          Overall_status: "Open",
          Material_type: item.MTART,
        });
      }
      number = req_no;
      }
    }
    else if(ip_type === "UPDATE"){
      await INSERT.into("litemdg.Change_Request").entries({
        REQUEST_NUMBER: req_no,
        InstanceID: "",
        REQUEST_TYPE: "MASS_UPDATE",
        Overall_status: "Open",
        Model: "Material",
        Requested_By: req.user.attr.email,
        Requested_Date: creationDate,
        Requested_Time: creationTime,
        Requested_on: timestamp,
        Description : req.data.Request_Desc,
      });
      const materialIds = new Set();
      switch(ip_Entity){
        case 'Material':
          for (const item of ip_mara) {
            await INSERT.into("litemdg.Change_Request_details").entries({
              Change_REQUEST_NUMBER: req_no,
              Object_ID: item.MATNR,
              Description: item.MAKT_MAKTX,
              Object_CUID: item.MATNR,
              Overall_status: "Open",
              Material_type: item.MTART,
            });
          }
          number = req_no;
        break;
        case 'Plant':
          for (const item of ip_plant) {
            if(!materialIds.has(item.mat_plant_MATNR)){
            const matdata = await SELECT.from(Mara).where({ MATNR: item.mat_plant_MATNR });
            const objectId = `${item.mat_plant_MATNR}|${item.WERKS}`;
            await INSERT.into("litemdg.Change_Request_details").entries({
              Change_REQUEST_NUMBER: req_no,
              Object_ID: item.mat_plant_MATNR,
              Description: matdata[0].MAKT_MAKTX,
              Object_CUID: objectId,
              Overall_status: "Open",
              Material_type: matdata[0].MTART,
            });
            materialIds.add(item.mat_plant_MATNR);
           }
          }
          number = req_no;
        break;
        case 'Description':
          for (const item of ip_desc) {
            if (!materialIds.has(item.Material_MATNR)) {
            const matdata = await SELECT.from(Mara).where({ MATNR: item.Material_MATNR });
            const objectId = item.Material_MATNR+'|'+item.code;
            await INSERT.into("litemdg.Change_Request_details").entries({
              Change_REQUEST_NUMBER: req_no,
              Object_ID: item.Material_MATNR,
              Description: matdata[0].MAKT_MAKTX,
              Object_CUID: objectId,
              Overall_status: "Open",
              Material_type: matdata[0].MTART, 
            });
           materialIds.add(item.Material_MATNR);
           }
          }
          number = req_no;
        break;
        case 'Storage Location':
          for (const item of ip_storage) {
            if(!materialIds.has(item.plant_mat_plant_MATNR)){
            const matdata = await SELECT.from(Mara).where({ MATNR: item.plant_mat_plant_MATNR });
            const objectId = `${item.plant_mat_plant_MATNR}|${item.plant_WERKS}|${item.LGORT}`;
            await INSERT.into("litemdg.Change_Request_details").entries({
              Change_REQUEST_NUMBER: req_no,
              Object_ID: item.plant_mat_plant_MATNR,
              Description: matdata[0].MAKT_MAKTX,
              Object_CUID: objectId,
              Overall_status: "Open",
              Material_type: matdata[0].MTART, // Optional, only if present in Storage
            });
            materialIds.add(item.plant_mat_plant_MATNR);
          }
          }
          number = req_no;

        break;
      }
    }
      return number;
    });
    this.on("SaveToDB", async (req) => {
      const { ip_req_no,ip_type,ip_Entity } = req.data;
      const tx = cds.transaction(req);
      let output = "Data saved to DB successfully!";

      try {
        const changeRequestDetails = await tx.run(
          SELECT.from("litemdg.Change_Request_details").where({
            Change_REQUEST_NUMBER: ip_req_no,
          })
        );
        if(ip_type === 'CREATE'){
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
                Material_ID: maraDummyData[0].ID,
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
                    plant_WERKS: plant.WERKS,
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
                cleanedEntry.Status = "Inactive";
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
                      plant_WERKS: plant.WERKS,
                    })
                  );
                }
              }
            }
          }
        }
       }
       else if(ip_type === 'UPDATE'){
        let changeRequestDetails; 
          switch (ip_Entity) {
            case "Material":
              output = "Material Data updated successfully!";
              changeRequestDetails = await tx.run(
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
                  const originalMara = await tx.run(SELECT.from(Mara).where({ MATNR: object_id }));
                  if (maraDummyData.length > 0) {
                    for (const entry of maraDummyData) {
                      const { MAX_NO, REQUEST_NUMBER, CREATION_TYPE, ...cleanedEntry } = entry;
                      cleanedEntry.Status = "Inactive";
                      await tx.run(UPDATE(Mara).set(cleanedEntry).where({ MATNR: entry.MATNR }));
                    }
                  }
                  if (originalMara.length > 0) {
                    originalMara[0].Status = "Inactive"
                    await tx.run(
                      UPDATE(mara_dummy).set(originalMara[0]).where({ MATNR: object_id })
                    );
                  }
                }

              }
              await tx.commit();
              break;
            case "Plant":
              output = "Plant Data updated successfully!";
              changeRequestDetails = await tx.run(
                SELECT.from("litemdg.Change_Request_details").where({
                  Change_REQUEST_NUMBER: ip_req_no,
                })
              );

              if (changeRequestDetails.length > 0) {
                for (const detail of changeRequestDetails) {
                  const { object_cuid } = detail;
                  const IDs = object_cuid.split('|');
                  const plantDummyData = await tx.run(
                    SELECT.from(Plant_dummy).where({
                      mat_plant_MATNR: IDs[0],
                      WERKS: IDs[1]
                    })
                  );
                  const originalPlant = await tx.run(SELECT.from(plant).where({
                    mat_plant_MATNR: IDs[0],
                    WERKS: IDs[1]
                  }));

                  if (plantDummyData.length > 0) {
                    for (const entry of plantDummyData) {
                      await tx.run(
                        UPDATE(plant).set(entry).where({
                          mat_plant_ID: entry.mat_plant_ID,
                          mat_plant_MATNR: entry.mat_plant_MATNR,
                          WERKS: entry.WERKS,
                        })
                      );
                    }
                  }
                  for (const p of originalPlant) {
                    await tx.run(
                      UPDATE(Plant_dummy).set(p).where({
                        mat_plant_ID: p.mat_plant_ID,
                        mat_plant_MATNR: p.mat_plant_MATNR,
                        WERKS: p.WERKS,
                      })
                    );
                    await tx.run(
                      UPDATE(mara_dummy).set({ Status: 'Inactive' }).where({ MATNR:p.mat_plant_MATNR })
                    );
                    await tx.run(
                      UPDATE(Mara).set({ Status: 'Inactive' }).where({ MATNR:p.mat_plant_MATNR })
                    );
                  }
                }
              }
              break;
            case "Storage Location":
              output = "Storage Location Data updated successfully!";
              changeRequestDetails = await tx.run(
                SELECT.from("litemdg.Change_Request_details").where({
                  Change_REQUEST_NUMBER: ip_req_no,
                })
              );

              if (changeRequestDetails.length > 0) {
                for (const detail of changeRequestDetails) {
                  const { object_cuid } = detail;
                  const IDs = object_cuid.split('|'); // [MATNR, WERKS, LGORT]

                  const storageDummyData = await tx.run(
                    SELECT.from(Storage_dummy).where({
                      plant_mat_plant_MATNR: IDs[0],
                      plant_WERKS: IDs[1],
                      LGORT: IDs[2]
                    })
                  );

                  const originalStorage = await tx.run(
                    SELECT.from(Storage_Location).where({
                      plant_mat_plant_MATNR: IDs[0],
                      plant_WERKS: IDs[1],
                      LGORT: IDs[2]
                    })
                  );

                  if (storageDummyData.length > 0) {
                    for (const entry of storageDummyData) {
                      await tx.run(
                        UPDATE(Storage_Location).set(entry).where({
                          plant_mat_plant_MATNR: entry.plant_mat_plant_MATNR,
                          plant_WERKS: entry.plant_WERKS,
                          LGORT: entry.LGORT,
                        })
                      );
                    }
                  }

                  for (const s of originalStorage) {
                    await tx.run(
                      UPDATE(Storage_dummy).set(s).where({
                        plant_mat_plant_MATNR: s.plant_mat_plant_MATNR,
                        plant_WERKS: s.plant_WERKS,
                        LGORT: s.LGORT,
                      })
                    );
                    await tx.run(
                      UPDATE(mara_dummy).set({ Status: 'Inactive' }).where({ MATNR:s.plant_mat_plant_MATNR })
                    );
                    await tx.run(
                      UPDATE(Mara).set({ Status: 'Inactive' }).where({ MATNR:s.plant_mat_plant_MATNR })
                    );
                  }
                }
              }
              break;
            case "Description":
              output = "Material Description Data updated successfully!";
              changeRequestDetails = await tx.run(
                SELECT.from("litemdg.Change_Request_details").where({
                  Change_REQUEST_NUMBER: ip_req_no,
                })
              );

              if (changeRequestDetails.length > 0) {
                for (const detail of changeRequestDetails) {
                  const {object_cuid } = detail;
                  const IDs = object_cuid.split('|'); // [MATNR, SPRAS]

                  const descDummyData = await tx.run(
                    SELECT.from(Description_dummy).where({
                      Material_MATNR: IDs[0],
                      code: IDs[1],
                    })
                  );

                  const originalDesc = await tx.run(
                    SELECT.from(Description).where({
                      Material_MATNR: IDs[0],
                      code: IDs[1],
                    })
                  );

                  if (descDummyData.length > 0) {
                    for (const entry of descDummyData) {
                      await tx.run(
                        UPDATE(Description).set(entry).where({
                          Material_MATNR: entry.Material_MATNR,
                          code: entry.code,
                        })
                      );
                    }
                  }

                  for (const d of originalDesc) {
                    await tx.run(
                      UPDATE(Description_dummy).set(d).where({
                        Material_MATNR: d.Material_MATNR,
                        code: d.code,
                      })
                    );
                    await tx.run(
                      UPDATE(mara_dummy).set({ Status: 'Inactive' }).where({ MATNR:d.Material_MATNR })
                    );
                    await tx.run(
                      UPDATE(Mara).set({ Status: 'Inactive' }).where({ MATNR:d.Material_MATNR })
                    );
                  }
                }
              }
              break;

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

      const  materialdata = await SELECT.from(Mara).where({ MATNR: ip_NewMatnr});

      const draft_material = await SELECT.from("litemdg.mara.drafts").where({ MATNR: ip_NewMatnr})

      if (materialdata.length > 0 || draft_material.length > 0 ){
        if (draft_material.length > 0){
        var msg = "Material number : " + ip_NewMatnr + " is drafted by user: " + draft_material[0].createdby
        req.error({
          code: 'Validation error',
          message: msg,
          status: 418
        })
        }
        else{
          req.error({
            code: 'Validation error',
            message: "Entity already Exists",
            status: 418
          })
        }
        return
      }

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

        let dummy_data = materialData;

        const draft_data = {
          creationdatetime: new Date().toISOString(),
          createdbyuser: req.user.attr.email,
          draftiscreatedbyme: true,
          lastchangedatetime: new Date().toISOString(),
          lastchangedbyuser: req.user.attr.email,
          inprocessbyuser: req.user.attr.email,
          draftisprocessedbyme: true
        };

        draft_data.draftuuid = await generateCUID()


        await tx.run(INSERT.into("draft_draftadministrativedata").entries(draft_data));

        materialData.draftadministrativedata_draftuuid = draft_data.draftuuid
        materialData.Status = 'Inactive'

        await tx.run(
          INSERT.into("litemdg.mara.drafts").entries(materialData)
        );

        dummy_data.CREATION_TYPE = 'SINGLE'
        await tx.run(
          INSERT.into(mara_dummy).entries(dummy_data)
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
          const updatedPlantData = await plantData.map(({ mat_plant_ID,mat_plant_MATNR, ...rest }) => ({
              ...rest,
              draftadministrativedata_draftuuid : draft_data.draftuuid,
              mat_plant_MATNR: ip_NewMatnr,
              mat_plant_ID: gen_ID,
          }));
          console.log(updatedPlantData);
  
          await tx.run(INSERT.into('litemdg.Plant.drafts').entries(updatedPlantData));
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

          await tx.run(INSERT.into('litemdg.storage.location.drafts').entries(updatedStorageData));
        }
        await tx.commit()
        return `Material ${ip_NewMatnr} successfully inserted into drafts.`;
      } catch (error) {
        console.error("Error in InsertMaterial action:", error);
        req.error(500, "Failed to insert material into drafts.");
      }

    });
    // this.on("Rule_validation", async (req) => {
    //   const { RulesHeader, RuleLineItems } = srv.entities;
    //   const { ip_ID } = req.data;
    //   const ID = ip_ID
    //   let modifiedCondition = "";
    //   let error_msg, default_value;
    //   let error_array = [];

    //   const ruleHeaders = await SELECT.from(RulesHeader).where({
    //     ruleType: "Validation",
    //   });

    //   for (const ruleHeader of ruleHeaders) {
    //     const ruleLineItems = await SELECT.from(RuleLineItems).where({
    //       ruleHeader_ID: ruleHeader.ID,
    //     });

    //     let conditions = [];

    //     for (const rule of ruleLineItems) {
    //       const {
    //         modelTable,
    //         modelTableField,
    //         operator,
    //         modelTableFieldValue,
    //         errorMessage,
    //         defaultValue,
    //       } = rule;
    //       let fieldValue;
    //       error_msg = errorMessage;
    //       default_value = defaultValue;

    //       if (modelTable === "MARA") {
    //         const query = await SELECT.from("litemdg.mara.drafts")
    //           .columns(modelTableField)
    //           .where({ id: ID });

    //         const fieldKey = modelTableField.toLowerCase();
    //         fieldValue = query[0] ? query[0][fieldKey] : null;
    //       } else if (modelTable === "MARC") {
    //         const query = await SELECT.from("litemdg.plant.drafts")
    //           .columns(modelTableField)
    //           .where({ mat_Plant_ID: ID });

    //         const fieldKey = modelTableField.toLowerCase();
    //         fieldValue = query[0] ? query[0][fieldKey] : null;
    //       }

    //       if (fieldValue !== undefined && fieldValue !== null) {
    //         let condition = `('${fieldValue}' == '${modelTableFieldValue}')`;
    //         conditions.push(condition);
    //         if (conditions.length > 0) {
    //           if (operator && (operator === "OR" || operator === "AND")) {
    //             conditions[conditions.length - 1] += ` ${operator}`;
    //           }
    //         }
    //       }
    //     }

    //     modifiedCondition = conditions
    //       .join(" ")
    //       .replace(/ OR /g, " || ")
    //       .replace(/ AND /g, " && ")
    //       .replace();

    //     const conditionMet = evaluateCondition(modifiedCondition);

    //     function evaluateCondition(condition) {
    //       try {
    //         return eval(condition);
    //       } catch (error) {
    //         console.error("Error evaluating condition:", error);
    //         return false;
    //       }
    //     }

    //     // if (conditionMet) {
    //     //   let defaultValues = [];

    //     //   if (
    //     //     typeof default_value === "string" &&
    //     //     default_value.includes(",")
    //     //   ) {
    //     //     defaultValues = default_value.split(",").map((val) => val.trim());
    //     //   } else {
    //     //     defaultValues = [default_value];
    //     //   }

    //     //   function normalizeValue(value, type) {
    //     //     if (type === "number") {
    //     //       return parseFloat(value);
    //     //     } else if (type === "string") {
    //     //       return String(value).replace(/^0+/, "");
    //     //     }
    //     //     return value;
    //     //   }

    //     //   const targetValue = req.data[ruleHeader.targetField];
    //     //   const targetType = typeof targetValue;

    //     //   const normalizedDefaults = defaultValues.map((val) =>
    //     //     normalizeValue(val, targetType)
    //     //   );

    //     //   if (
    //     //     !normalizedDefaults.includes(
    //     //       normalizeValue(targetValue, targetType)
    //     //     )
    //     //   ) {
    //     //     error_array.push(error_msg);
    //     //     req.error({
    //     //       code: "Validation Error",
    //     //       message: error_msg,
    //     //       status: 418,
    //     //     });

    //     //   }


    //     //   // if (!defaultValues.includes(req.data[ruleHeader.targetField])) {
    //     //   //     req.error(500, error_msg);
    //     //   // }
    //     //   // } else if (conditionMet && ruleHeader.isMandatory === true) {
    //     //   //     if (req.data[ruleHeader.targetField] === null || req.data[ruleHeader.targetField] === undefined) { // Corrected equality checks
    //     //   //         req.error(500, error_msg);
    //     //   //     }
    //     // }



    //   }
    //   return error_array

    // });

    this.on("Rule_validation", async(req) => {
      const { RulesHeader, RuleLineItems } = srv.entities;
      const { ip_ID } = req.data;
      const ID = ip_ID
      let modifiedCondition = "";
      let error_msg, default_value;
      let error_array = [];
      var data;

      const ruleHeaders = await SELECT.from(RulesHeader).where({
        ruleType: "Validation",
      });

      if (ruleHeaders.length>0)
      {

      for (const ruleHeader of ruleHeaders) {
        const ruleLineItems = await SELECT.from(RuleLineItems).where({
          ruleHeader_ID: ruleHeader.ID,
        });

        let conditions = [];
        if (ruleLineItems.length >0 ){
        for (const rule of ruleLineItems) {
          const {
            modelTable,
            modelTableField,
            operator,
            modelTableFieldValue,
            errorMessage,
            defaultValue,
          } = rule;
          let fieldValue;
          error_msg = errorMessage;
          default_value = defaultValue;

          if (modelTable === "MARA") {

            const query = await SELECT.from("litemdg.mara.drafts")
              .columns(modelTableField)
              .where({ id: ID });
            data =  await SELECT.from("litemdg.mara.drafts")
            .where({ id: ID });

            const fieldKey = modelTableField.toLowerCase();
            fieldValue = query[0] ? query[0][fieldKey] : null;
          } else if (modelTable === "MARC") {
            const query = await SELECT.from("litemdg.plant.drafts")
              .columns(modelTableField)
              .where({ mat_Plant_ID: ID });

            data = await SELECT.from("litemdg.plant.drafts")
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

        modifiedCondition = conditions
          .join(" ")
          .replace(/ OR /g, " || ")
          .replace(/ AND /g, " && ")
          .replace();

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
  
          const targetValue = data[0][ruleHeader.targetField.toLowerCase()];
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
          if (data[0][ruleHeader.targetField.toLowerCase()] === null || data[0][ruleHeader.targetField.toLowerCase()] === undefined) { // Corrected equality checks
            req.error({
              code: 'Validation Error',
              message: error_msg,
              status: 418
            })

          }
        }
      }
      return error_array
    }

    });
    this.on("Mass_Rule_validation", async (req) => {
      const { RulesHeader, RuleLineItems, } = srv.entities;
      const { ip_ID } = req.data;

      // const ID = ip_ID
      let modifiedCondition = "";
      let error_msg, default_value;
      const validateErrors = [];
      var data;

      const ruleHeaders = await SELECT.from(RulesHeader).where({
        ruleType: "Validation",
      });

      for(const ID of ip_ID){
      for (const ruleHeader of ruleHeaders) {
        const ruleLineItems = await SELECT.from(RuleLineItems).where({
          ruleHeader_ID: ruleHeader.ID,
        });

        let conditions = [];

        for (const rule of ruleLineItems) {
          const {
            modelTable,
            modelTableField,
            operator,
            modelTableFieldValue,
            errorMessage,
            defaultValue,
          } = rule;
          let fieldValue;
          error_msg = errorMessage;
          default_value = defaultValue;

          if (modelTable === "MARA") {
            const query = await SELECT.from(mara_dummy)
              .columns(modelTableField)
              .where({ MATNR: ID });
            data = await SELECT.from(mara_dummy)
            .where({ MATNR: ID });

            const fieldKey = modelTableField;
            fieldValue = query[0] ? query[0][fieldKey] : null;
          } else if (modelTable === "MARC") {
            const query = await SELECT.from(Plant_dummy)
              .columns(modelTableField)
              .where({ mat_Plant_MATNR: ID });

            data = await SELECT.from(Plant_dummy)
              .columns(modelTableField)
              .where({ mat_Plant_MATNR: ID });
      
            const fieldKey = modelTableField;
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

        modifiedCondition = conditions
          .join(" ")
          .replace(/ OR /g, " || ")
          .replace(/ AND /g, " && ")
          .replace();

        const conditionMet = evaluateCondition(modifiedCondition);

        function evaluateCondition(condition) {
          try {
            return eval(condition);
          } catch (error) {
            console.error("Error evaluating condition:", error);
            return false;
          }
        }
        var error_msg_temp = data[0].MATNR +": " + error_msg
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
  
          const targetValue = data[0][ruleHeader.targetField];
          const targetType = typeof targetValue;
  
          const normalizedDefaults = defaultValues.map(val => normalizeValue(val, targetType));
  
  
          if (!normalizedDefaults.includes(normalizeValue(targetValue, targetType))) {
            validateErrors.push({
              matnr: data[0].MATNR,
              errors: [
                {
                  message: error_msg,
                },
              ],
            });
  
          }
  
          // if (!defaultValues.includes(req.data[ruleHeader.targetField])) {
          //     req.error(500, error_msg);
          // }
        } else if (conditionMet && ruleHeader.isMandatory === true) {
          if ( data[0][ruleHeader.targetField]=== '' || data[0][ruleHeader.targetField] === "0.000" || data[0][ruleHeader.targetField] === null) { // Corrected equality checks
            validateErrors.push({
              matnr: data[0].MATNR,
              errors: [
                {
                  message: error_msg,
                },
              ],
            });

          }
        }
      }
      }
      req.reply({ validation_errors: validateErrors });

    });
    return super.init();
  }
};


