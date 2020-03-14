function gameloop() {
	tableHandling(); //DevBF();
	// deactivateTooltips();
	// activateTooltips();

	processPlayerChange();

	processStatus();

	if (processEnd()) return;

	if (processActions()) return;

	processWaitingFor();
}
