import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { DashboardSummary, StorageTrendPoint } from "../dashboard.models";
import { environment } from "../../../../environments/environment";

@Service()
export class Dashboard {

    private readonly http = inject(HttpClient);

    getSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${environment.apiUrl}/dashboard/summary`);
    }

    getStorageTrend(days: number = 30): Observable<StorageTrendPoint[]> {
        return this.http.get<StorageTrendPoint[]>(`${environment.apiUrl}/dashboard/storage-trend`, { params: { days } });
    }

}