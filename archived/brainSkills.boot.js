<script type="module">
  import { mountBrainSkills } from './brainSkills.js';

  const host = document.getElementById('brain-host') || document.querySelector('.canvas-container');

  const clusters = [
    { key:'frontal',   title:'Reasoning · Planning', items:[ {label:'Python'}, {label:'LangGraph'}, {label:'Neural Nets'}, {label:'LangChain'}, {label:'Prompting'} ]},
    { key:'visual',    title:'Visual Cortex',        items:[ {label:'Streamlit'}, {label:'Gradio'}, {label:'Plotly'}, {label:'Dash'} ]},
    { key:'motor',     title:'Motor · Control',      items:[ {label:'Agents'}, {label:'LLM Orchestration'}, {label:'Eval'}, {label:'MLflow'}, {label:'Seldon Core'} ]},
    { key:'temporalR', title:'Temporal · R',         items:[ {label:'Whisper'}, {label:'ASR'}, {label:'Prompting'} ]},
    { key:'temporalL', title:'Temporal · L',         items:[ {label:'RAG'}, {label:'Embeddings'}, {label:'Vector DBs'} ]},
    { key:'infra',     title:'Infrastructure',       items:[ {label:'Docker'}, {label:'Kubernetes'}, {label:'GCP'} ]},
  ];

  mountBrainSkills({
    container: host,
    glbPath: './brain.glb',
    clusters,
    options: {
      baseOpacity: 0.03,
      edgeStrength: 0.10,
      hoverScale: 1.12,
      labelBaseScale: 1.05,
      particles: { enabled:true, count:700, baseSize:2.2, pulseAmp:2.2, opacity:0.95, linksPerNode:3, linkDist:2.8, rewireMs:700 },
      carousel: { visibleCount: 3, switchMs: 3500, switchMsMobile: 4200 }
    }
  });
</script>