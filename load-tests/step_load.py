"""
Step load shape para DESCUBRIR la capacidad del sistema (el "knee").

Sube los usuarios en escalones parejos (ej. +25 cada 60s) hasta un maximo y
despues corta. En la pestana Charts vas a ver una escalera en "Number of Users";
el escalon donde el p95 se dispara y el RPS deja de subir = capacidad real.

Reusa los mismos 5 workflows de locustfile.py (no se duplica nada).

Uso:
  locust -f step_load.py --host http://localhost:8080 --headless \
    --csv results/step --html results/step.html

Parametros (via env vars, con defaults):
  STEP_USERS=25   usuarios que se suman por escalon
  STEP_TIME=60    segundos que dura cada escalon
  MAX_USERS=250   usuarios maximos; al superarlos, el test termina
  STEP_SPAWN=10   spawn rate (usuarios nuevos por segundo) dentro del escalon
"""

import os

from locust import LoadTestShape

# Locust necesita la clase User presente en el archivo que carga.
from locustfile import PayAndPrayUser  # noqa: F401


class StepLoadShape(LoadTestShape):
    step_users = int(os.environ.get("STEP_USERS", 25))
    step_time = int(os.environ.get("STEP_TIME", 60))
    max_users = int(os.environ.get("MAX_USERS", 250))
    spawn_rate = int(os.environ.get("STEP_SPAWN", 10))

    def tick(self):
        run_time = self.get_run_time()
        current_step = int(run_time // self.step_time) + 1
        users = current_step * self.step_users
        if users > self.max_users:
            return None  # corta el test
        return (users, self.spawn_rate)
