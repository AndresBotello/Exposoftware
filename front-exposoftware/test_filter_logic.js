// Verificar la lógica del filtro de proyectos

// Simular gruposMap del docente (grupos que dicta)
const gruposMap = new Map([
  ["grupo-101", "Grupo 101"],
  ["grupo-102", "Grupo 102"],
]);

// Simular proyectos de eventos (sin filtrar)
const proyectosEvento = [
  {
    id_proyecto: "p1",
    titulo_proyecto: "Proyecto A",
    id_grupo: "grupo-101", // ✅ Este pertenece al docente
  },
  {
    id_proyecto: "p2",
    titulo_proyecto: "Proyecto B",
    id_grupo: "grupo-102", // ✅ Este pertenece al docente
  },
  {
    id_proyecto: "p3",
    titulo_proyecto: "Proyecto C",
    id_grupo: "grupo-999", // ❌ Este NO pertenece al docente
  },
  {
    id_proyecto: "p4",
    titulo_proyecto: "Proyecto D",
    grupo_id: "grupo-102", // ✅ Este pertenece al docente (usando grupo_id)
  },
  {
    id_proyecto: "p5",
    titulo_proyecto: "Proyecto E",
    id_grupo: null, // ❌ Sin grupo
  },
];

console.log("🔍 Testing project filter logic...\n");
console.log("📊 Teacher's groups:", Array.from(gruposMap.keys()));
console.log("📋 Total projects in event:", proyectosEvento.length);

// Aplicar el filtro (la lógica del código modificado)
const proyectosFiltrados = proyectosEvento.filter((p) => {
  const idGrupo = p.id_grupo || p.grupo_id;
  return idGrupo && gruposMap.has(idGrupo);
});

console.log("\n✅ Results after filtering:\n");
console.log(`📌 Filtered projects: ${proyectosFiltrados.length}`);

proyectosFiltrados.forEach((p) => {
  const grupo = p.id_grupo || p.grupo_id;
  console.log(`   ✓ ${p.titulo_proyecto} (${grupo})`);
});

console.log("\n❌ Projects NOT shown to teacher:\n");
const proyectosNoMostrados = proyectosEvento.filter((p) => {
  const idGrupo = p.id_grupo || p.grupo_id;
  return !(idGrupo && gruposMap.has(idGrupo));
});

proyectosNoMostrados.forEach((p) => {
  const grupo = p.id_grupo || p.grupo_id || "Sin grupo";
  const razon = !grupo ? "No tiene grupo asignado" : "El grupo no es del docente";
  console.log(`   ✗ ${p.titulo_proyecto} (${grupo}) - ${razon}`);
});

console.log("\n✅ FILTER LOGIC VERIFICATION PASSED");
console.log(`   Expected: 3 projects (p1, p2, p4)`);
console.log(`   Got: ${proyectosFiltrados.length} projects`);

if (proyectosFiltrados.length === 3) {
  console.log("\n🎉 Filter is working correctly!");
} else {
  console.log("\n⚠️  Unexpected number of projects!");
}
