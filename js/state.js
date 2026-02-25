export const state = {
  stepIndex: 0,
  risposte: {}
};

export function resetState() {
  state.stepIndex = 0;
  state.risposte = {};
  localStorage.removeItem("ordine_bar_salvato");
}