const getKeyPredicateDynamic = (entityName, data, config, skipSlice = false) => {
  const entity = cds.model.definitions[entityName];
  if (!entity) return "";

  // let keys = entity.keys.map(k => k.name);
  let keys = Object.keys(entity.keys);
  if (config && config.key_fields) {
    keys = config.key_fields.split(',').map(k => k.trim());
    if (config.foreign_key_fields) {
      keys = [...config.foreign_key_fields.split(',').map(k => k.trim()), ...keys];
    }
  }

  let keyValues = keys.map((key) => data[key]).filter((v) => v !== undefined);

if (!skipSlice) {
  keyValues = keyValues.slice(1); 
}

return keyValues.join("|");
};

  // Function to log change
const logChange = async (operation, entityName, entityKey, changedAt, changedBy, fieldName, oldValue, newValue, note, ChangeLog,EntityItems,parentKey) => {
  console.log("inside log change");
  const entityDef = cds.model.definitions[entityName];
  let uiSection;
  let fieldDesc = fieldName
  if (entityDef && entityDef.elements && entityDef.elements[fieldName]) {
    const element = entityDef.elements[fieldName];
    const annotations = entityDef['$flatAnnotations'] || {};
    // Try fetching label or @Common.Label annotation
    // fieldDesc = element['@Common.Label'] || element['@title'] || fieldName;
    // fieldDesc = `${fieldDesc} (${fieldName})`; // Final formatted field label
    var label = element['@Common.Label'] || element['@title'];
    fieldDesc = label && label !== fieldName ? `${label} (${fieldName})` : fieldName;
    // for (const [annoKey, value] of Object.entries(annotations)) {
    //   if (
    //     annoKey.startsWith('@UI.FieldGroup#') &&
    //     annoKey.endsWith('.Data') &&
    //     Array.isArray(value)
    //   ) {
    //     const found = value.find(
    //       item => item?.Value === fieldName || item?.Value?.['='] === fieldName
    //     );

    //     if (found) {
    //       // Extract group name
    //       const rawGroupName = annoKey.split('#')[1].split('.')[0];
    //       const groupName = rawGroupName.replace(/\d+$/, '');
    //       uiSection = groupName;
    //       break;
    //     }
    //   }
    // }
  }
  fieldName = fieldDesc;
  const entity = entityName.split('.')[1];
  const section = entity + '(' + uiSection + ')';
  // entityName = section || entityName;
  const childConfigs = await SELECT.from(EntityItems).where({  parent_entity: entityName });
  entityName = childConfigs[0].description || entity;



  await INSERT.into(ChangeLog).entries({
    operation,
    entityName,
    entityKey,
    changedAt,
    changedBy,
    fieldName,
    oldValue: oldValue !== null && typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue?.toString(),
    newValue: newValue !== null && typeof newValue === 'object' ? JSON.stringify(newValue) : newValue?.toString(),
    notes: note,
    parentKey
  });
};

  // Recursive function to process child entities
  // const processComposedEntities = async (parentEntityName, parentData, parentKey, operation, changedAt, changedBy) => {
  //   const childConfigs = await SELECT.from(entity_items).where({ parent_entity: parentEntityName });

  //   for (const config of childConfigs) {
  //     const childCollectionName = config.child_element; // Use the collection name from entity_items

  //     if (childCollectionName && parentData[childCollectionName]) {
  //       const ChildEntity = cds.model.definitions[config.child_entity];
  //       const children = Array.isArray(parentData[childCollectionName]) ? parentData[childCollectionName] : [parentData[childCollectionName]];

  //       for (const child of children) {
  //         const childKeyPart = getKeyPredicateDynamic(config.child_entity, child, config);
  //         const combinedKey = parentKey ? `${parentKey}|${childKeyPart}` : childKeyPart;

  //         if (operation === 'CREATE') {
  //           for (const field in child) {
  //             if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation) {
  //               await logChange(operation, ChildEntity.name, combinedKey, changedAt, changedBy, field, null, child[field]);
  //             }
  //           }
  //         } else if (operation === 'DELETE' && parentData._beforeData && parentData._beforeData[childCollectionName]) {
  //           const beforeChildren = Array.isArray(parentData._beforeData[childCollectionName]) ? parentData._beforeData[childCollectionName] : [parentData._beforeData[childCollectionName]];
  //           const matchingBeforeChild = beforeChildren.find(before => getKeyPredicateDynamic(config.child_entity, before, config) === childKeyPart);
  //           if (matchingBeforeChild) {
  //             for (const field in matchingBeforeChild) {
  //               if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation) {
  //                 await logChange(operation, ChildEntity.name, combinedKey, changedAt, changedBy, field, matchingBeforeChild[field], null);
  //               }
  //             }
  //           }
  //         } else if (operation === 'UPDATE' && parentData._beforeData && parentData._beforeData[childCollectionName]) {
  //           const beforeChildren = Array.isArray(parentData._beforeData[childCollectionName]) ? parentData._beforeData[childCollectionName] : [parentData._beforeData[childCollectionName]];
  //           const matchingBeforeChild = beforeChildren.find(before => getKeyPredicateDynamic(config.child_entity, before, config) === childKeyPart);
  //           if (matchingBeforeChild) {
  //             for (const field in child) {
  //               if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation && matchingBeforeChild[field] !== child[field]) {
  //                 await logChange(operation, ChildEntity.name, combinedKey, changedAt, changedBy, field, matchingBeforeChild[field], child[field]);
  //               }
  //             }
  //           }
  //         }

  //         // Recursive call
  //         await processComposedEntities(config.child_entity, child, combinedKey, operation, changedAt, changedBy);
  //       }
  //     }
  //   }
  // };
  const processComposedEntities = async (parentEntityName, parentData, parentKey, operation, changedAt, changedBy, EntityItems, ChangeLog, req_no,key) => {
    console.log("inside child entites")
    const childConfigs = await SELECT.from(EntityItems).where({ parent_entity: parentEntityName });
  
    for (const config of childConfigs) {
      const childElementNames = config.child_element ? config.child_element.split(',').map(s => s.trim()) : [];
      const childEntityNames = config.child_entity ? config.child_entity.split(',').map(s => s.trim()) : [];
  
      if (childElementNames.length === childEntityNames.length) {
        for (let i = 0; i < childElementNames.length; i++) {
          const childCollectionName = childElementNames[i];
          const childEntityName = childEntityNames[i];
          
  
          if (childCollectionName && parentData[childCollectionName]) {
            const ChildEntity = cds.model.definitions[childEntityName];
            if (!ChildEntity) {
              console.warn(`Child entity definition not found: ${childEntityName}`);
              continue; // Skip to the next child if definition is missing
            }
  
            const children = Array.isArray(parentData[childCollectionName]) ? parentData[childCollectionName] : [parentData[childCollectionName]];
            const beforeChildrenData = await fetchBeforeChildren(childEntityName, parentData[childCollectionName], config);
            
            for (const child of children) {
              const childKeyPart = getKeyPredicateDynamic(childEntityName, child, config);
              const combinedKey = parentKey ? `${parentKey}|${childKeyPart}` : childKeyPart;
              const matchingBeforeChild = beforeChildrenData.find(beforeChild => getKeyPredicateDynamic(childEntityName, beforeChild, config) === childKeyPart);
              if (operation === 'CREATE') {
                // for (const field in child) {
                //   if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation) {
                //     await logChange(operation, ChildEntity.name, childKeyPart, changedAt, changedBy, field, null, child[field]);
                //   }
                // }
                const childId = child[ChildEntity.keys[0]];
                await logChange(operation, ChildEntity.name, childKeyPart, changedAt, changedBy, null, null, childId, req_no,ChangeLog,EntityItems,key);
              } else if (operation === 'DELETE') {
                const beforeChildren = Array.isArray(parentData._beforeData[childCollectionName]) ? parentData._beforeData[childCollectionName] : [parentData._beforeData[childCollectionName]];
                const matchingBeforeChild = beforeChildren.find(before => getKeyPredicateDynamic(childEntityName, before, config) === childKeyPart);
                if (matchingBeforeChild) {
                  for (const field in matchingBeforeChild) {
                    if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation) {
                      await logChange(operation, ChildEntity.name, childKeyPart, changedAt, changedBy, field, matchingBeforeChild[field], null, ChangeLog);
                    }
                  }
                }
              } else if (operation === 'UPDATE') {
                // Corrected to parentBeforeData
                // if (matchingBeforeChild) {
                //   for (const field in child) {
                //     if (ChildEntity.elements[field] && !ChildEntity.elements[field].isAssociation && matchingBeforeChild[field] !== child[field]) {
                //       await logChange(operation, ChildEntity.name, combinedKey, changedAt, changedBy, field, matchingBeforeChild[field], child[field]);
                //     }
                //   }
                // }
                if (matchingBeforeChild) {
                  for (const field in child) {
                    if (
                      ChildEntity.elements[field] &&
                      !ChildEntity.elements[field].isAssociation &&
                      matchingBeforeChild[field] !== child[field]
                    ) {
                      await logChange(
                        operation,
                        ChildEntity.name,
                        childKeyPart,
                        changedAt,
                        changedBy,
                        field,
                        matchingBeforeChild[field],
                        child[field],
                        req_no,
                        ChangeLog,
                        EntityItems,
                        key
                      );
                    }
                  }
                } else {
                  // The child didn't exist before, so log it as created
                  const childId = child[ChildEntity.keys[0]];
                  await logChange(
                    "CREATE",
                    ChildEntity.name,
                    childKeyPart,
                    changedAt,
                    changedBy,
                    null,
                    null,
                    childKeyPart,
                    req_no,
                    ChangeLog,
                    EntityItems,
                    key
                  );
                }
              }
  
              // Recursive call for the current child entity
              // await processComposedEntities(childEntityName, child, childKeyPart, operation, changedAt, changedBy);
              await processComposedEntities(childEntityName, child, combinedKey, operation, changedAt, changedBy,EntityItems,ChangeLog,req_no,key);
            }
          }
        }
      } else {
        console.warn(`Mismatched number of child elements and entities for parent: ${parentEntityName}`);
      }
    }
  };
  
  // async function fetchBeforeChildren(childEntityName, childrenData, config) {
  //   const ChildEntity = cds.model.definitions[childEntityName];
  //   if (!ChildEntity) {
  //     return []; // Return empty array if child entity definition not found
  //   }
  
  //   const beforeChildren = [];
  //   for (const child of childrenData) {
  //     const whereClause = {};
  //     let hasKeys = false;
  
  //      const childKeyPredicate = getKeyPredicateDynamic(childEntityName, child, config);
  //      const keyValues = childKeyPredicate.split(',');
  //       for(const pair of keyValues){
  //         const [keyName,keyValue] = pair.split('=');
  //          if(keyName && keyValue){
  //            whereClause[keyName] = keyValue;
  //            hasKeys = true;
  //          }
  //       }
  
  
  //     if (hasKeys) {
  //       const beforeChild = await SELECT.one(childEntityName).where(whereClause);
  //       if (beforeChild) {
  //         beforeChildren.push(beforeChild);
  //       }
  //     }
  //      else{
  //        const beforeChild = await SELECT.one(childEntityName).where(child);
  //         if (beforeChild) {
  //         beforeChildren.push(beforeChild);
  //       }
  //      }
  //   }
  //   return beforeChildren;
  // }
  async function fetchBeforeChildren(childEntityName, childrenData, config) {
    const ChildEntity = cds.model.definitions[childEntityName];
    if (!ChildEntity) {
      return [];
    }
  
    const beforeChildren = [];
    for (const child of childrenData) {
      const whereClause = {};
      let hasKeys = false;
  
      const childKeyPredicate = getKeyPredicateDynamic(childEntityName, child, config, true);
      let keyValues;
      if (childKeyPredicate.includes('=')) {
        keyValues = childKeyPredicate.split(',');
      } else {
        keyValues = childKeyPredicate.split('|');
      }
      // const keyNames = ChildEntity.keys ? Object.keys(ChildEntity.keys) : []; 
      // Get key names
      const keyNames = ChildEntity.keys ? Object.keys(ChildEntity.keys).filter(key => !ChildEntity.elements[key].isAssociation) : [];
  
      for (let i = 0; i < keyValues.length; i++) {
        const keyValue = keyValues[i].trim();
        if (keyNames[i]) { // Use key names in order
          whereClause[keyNames[i]] = keyValue;
          hasKeys = true;
        }
      }
  
  
      if (hasKeys) {
        const beforeChild = await SELECT.one(childEntityName).where(whereClause);
        if (beforeChild) {
          beforeChildren.push(beforeChild);
        }
      } else {
        const beforeChild = await SELECT.one(childEntityName).where(child);
        if (beforeChild) {
          beforeChildren.push(beforeChild);
        }
      }
    }
    return beforeChildren;
  };

  module.exports = { 
    getKeyPredicateDynamic,
    logChange,
    processComposedEntities,
    fetchBeforeChildren
  }