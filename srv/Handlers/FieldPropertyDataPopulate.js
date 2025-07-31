module.exports = async function (srv) {
  const mySrv = srv;
  const { ModelHeaderSet, FieldAtribute, EntityItems } = srv.entities
  cds.on("serving", async () => {
    const db = await cds.connect.to('db');
    const model = cds.model;
    const now = new Date().toISOString();
    const user = 'SYSTEM';


    await db.run(DELETE.from(FieldAtribute));
    await db.run(DELETE.from(EntityItems));
    await db.run(DELETE.from(ModelHeaderSet));

    const modelGroups = {}; // group by modelName (middle namespace)

    const serviceDef = Object.values(cds.model.definitions).find(
      def => def.kind === 'service'
    );
    const serviceName = serviceDef.name;
    const parentEntities = new Set();
    for (const [entityName, def] of Object.entries(model.definitions)) {
      if (
        def.kind !== 'entity' ||
        def.kind === 'service' ||
        def.kind === 'type' ||
        def.kind === 'action' ||
        entityName.includes('common') ||
        entityName.includes('DRAFT') ||
        entityName.includes('dummy') ||
        entityName.startsWith('localized.') ||
        entityName.includes('FieldControl_') ||
        def._service // skip services bound to definitions
      ) continue;

      // Extract modelName from entity namespace — 2nd segment
      const parts = entityName.split('.');
      if (parts.length < 3) continue;

      const modelName = parts[1]; // "costcenter", "profitcenter", etc.
      const sEntityName = parts[2];
      const fieldAtribute = [];
      const childEntities = [];
      const technicalFields = new Set([
        'ID',
        'createdAt',
        'createdBy',
        'modifiedAt',
        'modifiedBy',
        'IsActiveEntity',
        'HasDraftEntity',
        'DraftAdministrativeData_DraftUUID',
        'Status',
        'Request_Desc'

      ]);


      for (const [fieldName, element] of Object.entries(def.elements)) {

        if (element.type === 'cds.Composition' && element.target && !element.target.includes('FieldControl_')) {
          childEntities.push(element.target);

          if (element.target && cds.model.definitions[element.target]) {
            parentEntities.add(element.target); // mark target as parent
          }
        }

        if (element.type === 'cds.Timestamp' || element.type === 'cds.Association' ||
          element.type === 'cds.Composition' || fieldName.includes("_ID") ||
          technicalFields.has(fieldName)) continue;
        let oFileAtribute = {
          createdAt: now,
          createdBy: user,
          modifiedAt: now,
          modifiedBy: user,
          fieldName,
          description: element['@Common.Label'] || fieldName.replace(/([a-z])([A-Z])/g, '$1 $2'),
          isVisible: null,
          isEditable: null,
          isMandatory: null,
          entityItems_entity: sEntityName,
          entityItems_modelHeader_modelName: modelName,
          IsActiveEntity: true,
          IsKey: !!element.key
        };
        fieldAtribute.push(oFileAtribute);
        // await db.run(INSERT.into("FinanceMDGService.FieldAtribute").entries(oFileAtribute));

      }

      const draftName = `${serviceName}.${entityName.split('.').pop()}.drafts`;
      const sDummyEntityName = `${serviceName}.${entityName.split('.').pop()}_dummy`;
      const hasDraft = model.definitions[entityName] ? true : false;
      const sParentEntityName  = `${serviceName}.${entityName.split('.').pop()}`;
      //get child_elements
      const aChild_elements = [];

      Object.keys(model.definitions[entityName].elements).forEach(element => {
        const el = model.definitions[entityName].elements[element];
        if (el.type === 'cds.Composition' && !element.includes('_fieldControl')) {
          aChild_elements.push(element);
        }
      });

      const child_elementStr = aChild_elements.join(',');
      const isParent = parentEntities.has(entityName);
      const entityItem = {
        entity: sEntityName,
        node: isParent === true ? 'Child' : 'Parent',
        draftEntityName: hasDraft ? draftName : null,
        dummyEntityName: sDummyEntityName,
        description: sEntityName.replace(/([a-z])([A-Z])/g, '$1 $2'),
        createdAt: now,
        createdBy: user,
        modifiedAt: now,
        modifiedBy: user,
        parent_entity: sParentEntityName,
        child_entity: childEntities.join(','),
        child_element: child_elementStr,
        fieldAtribute
      };

      // Group into modelGroups
      if (!modelGroups[modelName]) modelGroups[modelName] = [];
      modelGroups[modelName].push(entityItem);

    }

    // Build final JSON structure
    const finalResult = {
      value: Object.entries(modelGroups).map(([modelName, entityItems]) => ({
        modelName,
        description: modelName.replace(/([a-z])([A-Z])/g, '$1 $2') + " Model",
        createdAt: now,
        createdBy: user,
        entityItem: entityItems
      }))
    };

    await db.run(INSERT.into(ModelHeaderSet).entries(finalResult.value));
    console.log(JSON.stringify(finalResult, null, 2));





  });
}
