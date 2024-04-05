// const alloyProcess = exec("java -jar jar/org.alloytools.alloy.dist.jar");
//
// process.on("exit", () => {
//   alloyProcess.kill();
// });
//
// chokidar.watch("inst.xml", { usePolling: true }).on("all", (event, path) => {
//   const instXml = fs.readFileSync("inst.xml", "utf8");
//   console.log("File changed, regenerating domain and substance ...");
//   const rawExported = xml2js(instXml, { compact: true }) as RawAlloyExported;
//   const sources = safeArray(rawExported.alloy.source).map(
//     (rawSource) => rawSource._attributes.content
//   );
//   sources.forEach((source, i) => {
//     console.log(`Source ${i} written to file.`);
//     fs.writeFileSync(`source${i}.als`, source);
//   });
//
//   console.log("Calling the AlloyExtractor ...");
//   execSync(
//     `java -jar jar/alloyextractor.jar --input source0.als --output model.json`
//   );
//   console.log("AlloyExtractor finished.");
//
//   const modelShape = JSON.parse(fs.readFileSync("model.json", "utf8"));
//   const model = compileModel(modelShape);
//   const domain = translateToDomain(model);
//   fs.writeFileSync("domain.domain", domain);
//   console.log("Domain generated: \n" + domain + "\n ======================");
//
//   const inst = compileInstance(instXml);
//   const substance = translateToSubstance(inst, model);
//
//   // TODO: handle multiple substances
//   fs.writeFileSync("substance.substance", substance);
//   console.log("Substance generated: \n" + domain + "\n ======================");
//
//   console.log("Done");
// });
//

import "./reactive/reactive.js";
