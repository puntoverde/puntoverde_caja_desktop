<template>
<v-app>
  <v-system-bar app color="primary" class="pr-0">
      <v-icon color="white mr-3">mdi-file</v-icon>
      <span>reporte de pagos</span>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" @click="minimizar">
        <v-icon color="white">mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn size="small" variant="text" @click="close">
        <v-icon color="white">mdi-window-close</v-icon>
      </v-btn>
    </v-system-bar>
    <v-app-bar app color="secondary" dark>
        <v-toolbar-title>Pagos Agrupados</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn  @click="buscar"  text><v-icon>mdi-magnify</v-icon> Buscar Pagos</v-btn>
        <v-btn color="mr-3" text @click="imprimir" v-if="lst_pagos.length>0">
        <v-icon class="mr-1">mdi-printer</v-icon>Imprimir
      </v-btn>
        <v-btn text @click="exportar" v-if="lst_pagos.length>0"><v-icon>mdi-file-excel</v-icon>Exportar</v-btn>
        <v-btn text @click="generar" v-if="lst_pagos.length>0">
          <v-icon>mdi-file-pdf</v-icon>Generar
        </v-btn>
        <template v-slot:extension>
          <v-row>
         
          <v-col class="py-0">
            <!-- <v-select label="Cajero(a)" v-model="cajero"  :items="lst_cajero" item-value="cve_persona" item-text="cajero" clearable hide-details color="secondary"></v-select> -->
            <v-text-field readonly label="Cajero(a)" v-model="cajeroText"></v-text-field>
          </v-col>
          <v-col class="py-0">
            <!-- <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }"> -->
                <v-text-field
                  v-model="date"
                  label="Dia Inicio"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  clearable
                  hide-details
                  color="secondary"
                >
                <q-popup-proxy   transition-show="scale" transition-hide="scale">
              <v-card>
                  <q-date  color="primary" v-model="date" mask="YYYY-MM-DD"></q-date>
              </v-card>
              </q-popup-proxy>
                </v-text-field>
              <!-- </template>
              <v-date-picker v-model="date" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu.save(date)">OK</v-btn>
              </v-date-picker>
            </v-menu> -->
          </v-col>
          <v-col class="py-0">
            <!-- <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :return-value.sync="date2"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }"> -->
                <v-text-field
                  v-model="date2"
                  label="Dia Fin"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  clearable
                  hide-details
                  color="secondary"
                >
                <q-popup-proxy   transition-show="scale" transition-hide="scale">
              <v-card>
                  <q-date  color="primary" v-model="date2" mask="YYYY-MM-DD"></q-date>
              </v-card>
              </q-popup-proxy>
                </v-text-field>
              <!-- </template>
              <v-date-picker v-model="date2" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu2 = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu2.save(date2)">OK</v-btn>
              </v-date-picker>
            </v-menu> -->
          </v-col>
        </v-row>
        </template>
    </v-app-bar>
    <v-main app id="conttt">
      <v-container fluid>
  <div>
    <!-- <v-card>
      <v-card-title class="d-flex justify-space-between">Reporte de Pago Concentrado por Cajera
        <div>
          <v-btn color="secondary mr-3" @click="buscar" v-if="cValid"><v-icon>mdi-magnify</v-icon> Buscar Pagos</v-btn>
          <v-btn color="secondary" @click="exportar" v-if="lst_pagos.length>0">
          <v-icon>mdi-file-excel</v-icon>Exportar
        </v-btn>
        </div>
        </v-card-title>
      <v-card-text>
        <v-row>
         
          <v-col class="py-0">
            <v-select label="Cajero(a)" v-model="cajero"  :items="lst_cajero" item-value="cve_persona" item-text="cajero" clearable hide-details color="secondary"></v-select>
          </v-col>
          <v-col class="py-0">
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date"
                  label="Picker in menu"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  clearable
                  hide-details
                  color="secondary"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu.save(date)">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
          <v-col class="py-0">
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :return-value.sync="date2"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="date2"
                  label="Picker in menu"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  clearable
                  hide-details
                  color="secondary"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date2" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu2 = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu2.save(date2)">OK</v-btn>
              </v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card> --> 

    <v-table class="elevation-3 mt-5">

    
       <thead>
         <tr>
           <th>Clave</th>
           <th>Concepto</th>
           <th>Cantidad</th>
           <th>Importe</th>
           <th>Descuento</th>
           <th>Monto Total</th>
         </tr>
       </thead>
       <tbody>
         <tr v-for="pago in lst_pagos" :key="pago.cve_cuota">           
           <td>{{pago.cve_cuota}}</td>
           <td>{{pago.descripcion}}</td>
           <td>{{numeral(pago.cantidad).format("0,0[.]00")}}</td>
           <td>{{numeral(pago.monto).format("0,0[.]00")}}</td>
           <td>{{numeral(pago.descuento).format("0,0[.]00")}}</td>
           <td>{{numeral(pago.total).format("0,0[.]00")}}</td>           
         </tr>
       </tbody>
       <tfoot>
         <tr>
           <th colspan="3"></th>
           <th>{{numeral(cTotal).format("0,0[.]00")}}</th>           
           <th>{{numeral(cDescuento).format("0,0[.]00")}}</th>           
           <th>{{numeral(cTotal-cDescuento).format("0,0[.]00")}}</th>   
                   
         </tr>
         <tr>
           <th colspan="6" >
             <div class="d-flex justify-space-around"> 
               <v-chip>Efectivo: {{numeral(efectivo).format("0,0[.]00")}}</v-chip>
               <v-chip>Credito: {{numeral(credito).format("0,0[.]00")}}</v-chip>
               <v-chip>Debito: {{numeral(debito).format("0,0[.]00")}}</v-chip>
               <v-chip>Cheque: {{numeral(cheque).format("0,0[.]00")}}</v-chip>
               <v-chip>Transferencia: {{numeral(transferencia).format("0,0[.]00")}}</v-chip>
               </div>
           </th>
         </tr>
       </tfoot>
    

    </v-table>
    
  </div>
      </v-container>
    </v-main>
</v-app>
</template>

<script setup lang="ts">
import {ref,computed,watch,onMounted} from 'vue'
import _ from 'lodash'
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import "jspdf-autotable";
import numeral from "numeral";
import printJS from 'print-js'
import dayjs from 'dayjs'
import {QDate,QPopupProxy} from 'quasar'
import type {IPagosFilterConcepto} from './../../../main/model/model-type'
import {useStorage} from 'vue3-storage'

const ls=useStorage()

  // created(){
    
  //   this.cajeroText=this.$ls.get("usuario",'');
  //   this.cajero=this.$ls.get("cve_persona",0);
  //   this.buscar()
  //   },
      
      const cajero=ref(undefined)
      const cajeroText=ref('')
      const menu=ref(false)
      const date=ref(dayjs().format('YYYY-MM-DD'))
      const menu2=ref(false)
      const date2=ref(dayjs().format('YYYY-MM-DD'))
      const lst_cajero=ref([])
      const lst_pagos=ref([])
      const efectivo=ref(0)
      const credito=ref(0)
      const debito=ref(0)
      const cheque=ref(0)
      const transferencia=ref(0)


      const cSubtotal=computed(()=>{
      
      return lst_pagos.value.map(item=>parseFloat(_.isNull(item.subtotal)?0:item.subtotal)).reduce((reductor,value)=>reductor+value,0);
    })
    const cIva=computed(()=>{
      return lst_pagos.value.map(item=>parseFloat(_.isNull(item.iva)?0:item.iva)).reduce((reductor,value)=>reductor+value,0);
    })
    const cTotal=computed(()=>{
      // return this.lst_pagos.map(item=>parseFloat(_.isNull(item.total)?0:item.total)).reduce((reductor,value)=>reductor+value,0);
      return lst_pagos.value.map(item=>parseFloat(_.isNull(item.monto)?0:item.monto)).reduce((reductor,value)=>reductor+value,0);
    })
    const cDescuento=computed(()=>{
      return lst_pagos.value.map(item=>parseFloat(_.isNull(item.descuento)?0:item.descuento)).reduce((reductor,value)=>reductor+value,0);
    })
    const cValid=computed(()=>{
       
      return !_.isUndefined(cajero.value) && !_.isNull(date.value) &&  !_.isNull(date2.value)
    })

  watch(cValid,(val)=>{
      if(!val)lst_pagos.value=[]
    })
     

    
    onMounted(()=>{
      buscar()
      cajeroText.value=ls.getStorageSync('user')
    })

    function buscar()
    {
      const dataSend:IPagosFilterConcepto={
        cajero:1,
        fecha_inicio:date.value,
        fecha_fin:date2.value
      }

      let data=window.electron.getPagosConcentrados(dataSend)
        if(data){
        lst_pagos.value=data.conceptos;
        let forma_pago=data.forma_pago;
        console.log(forma_pago)
        efectivo.value=_.isUndefined(forma_pago.find(item=>item.clave==1))?0:forma_pago.find(item=>item.clave==1).monto;
        credito.value=_.isUndefined(forma_pago.find(item=>item.clave==4))?0:forma_pago.find(item=>item.clave==4).monto;
        debito.value=_.isUndefined(forma_pago.find(item=>item.clave==28))?0:forma_pago.find(item=>item.clave==28).monto;
        cheque.value=_.isUndefined(forma_pago.find(item=>item.clave==2))?0:forma_pago.find(item=>item.clave==2).monto;
        transferencia.value=_.isUndefined(forma_pago.find(item=>item.clave==3))?0:forma_pago.find(item=>item.clave==3).monto;
        }
    }

    function imprimir(){
      let reporte=document.createElement('div');
      let titulo=document.createElement('h2')
      let periodo=document.createElement('div');
      let cajero=document.createElement('span');
      let table=document.createElement('table');
      let header=document.createElement('thead');
      let header_tr=document.createElement('tr');
      let tbody=document.createElement('tbody')
      let tfoot =document.createElement('tfoot')

      titulo.appendChild(document.createTextNode('Reporte de Corte Caja Agrupado'))
      reporte.appendChild(titulo)
      titulo.style.textAlign="center"
      titulo.style.padding="0 0 0 0"
      titulo.style.margin="0 0 0 0"

      periodo.style.textAlign="center";
      periodo.style.marginBottom="5px"

      periodo.appendChild(document.createTextNode(`Perido del ${dayjs(date.value).format("DD/MM/YYYY")} al ${dayjs(date2.value).format("DD/MM/YYYY")} ,  Cajero(a): ${cajeroText.value}`))
     
      reporte.appendChild(periodo)
      

      let cargo=document.createElement('th');
      cargo.appendChild(document.createTextNode('Concepto'))
      cargo.style.border="1px solid #000"
      cargo.style.borderCollapse='collapse'
      cargo.style.padding="0 2px 0 2px"
      header_tr.appendChild(cargo)

      let periodoh=document.createElement('th');
      periodoh.appendChild(document.createTextNode('Descuento'))
      periodoh.style.border="1px solid #000"
      periodoh.style.borderCollapse='collapse'
      periodoh.style.padding="0 2px 0 2px"
      header_tr.appendChild(periodoh)

      let fecha_cobro=document.createElement('th');
      fecha_cobro.appendChild(document.createTextNode('Cantidad'))
      fecha_cobro.style.border="1px solid #000"
      fecha_cobro.style.borderCollapse='collapse'
      fecha_cobro.style.padding="0 2px 0 2px"
      header_tr.appendChild(fecha_cobro)

      let subtotal=document.createElement('th');
      subtotal.appendChild(document.createTextNode('Subtotal'))
      subtotal.style.border="1px solid #000"
      subtotal.style.borderCollapse='collapse'
      subtotal.style.padding="0 2px 0 2px"
      header_tr.appendChild(subtotal )

      let total=document.createElement('th');
      total.appendChild(document.createTextNode('Total'))
      total.style.border="1px solid #000"
      total.style.borderCollapse='collapse'
      total.style.padding="0 2px 0 2px"
      header_tr.appendChild(total)


      /// estilos
      table.style.width='100%'
      table.style.borderCollapse="collapse"
      header_tr.style.backgroundColor="#d1d1d1"
      header_tr.style.borderCollapse='collapse'

      header.appendChild(header_tr)
      
      table.appendChild(header)



      lst_pagos.value.forEach(item => 
        {
        let tr_body=document.createElement('tr')
        tr_body.style.textAlign="center"

        let conceptoTD=document.createElement('td')
        conceptoTD.style.fontSize="12px"
        conceptoTD.style.border="1px solid #000"
        conceptoTD.style.padding="0 2px 0 2px"
        conceptoTD.appendChild(document.createTextNode(item.descripcion))
        tr_body.appendChild(conceptoTD)
        
        let cantidadTD=document.createElement('td')
        cantidadTD.style.fontSize="12px"
        cantidadTD.style.border="1px solid #000"
        cantidadTD.style.padding="0 2px 0 2px"
        cantidadTD.appendChild(document.createTextNode(item.cantidad))
        tr_body.appendChild(cantidadTD)
        
        let periodoTD=document.createElement('td')
        periodoTD.style.fontSize="12px"
        periodoTD.style.border="1px solid #000"
        periodoTD.style.padding="0 2px 0 2px"
        periodoTD.appendChild(document.createTextNode(item.descuento))
        tr_body.appendChild(periodoTD)



        let subtotalTD=document.createElement('td')
        subtotalTD.style.fontSize="12px"
        subtotalTD.style.border="1px solid #000"
        subtotalTD.style.padding="0 2px 0 2px"
        subtotalTD.appendChild(document.createTextNode(numeral(_.round(item.subtotal,2)).format('0,0[.]00')))
        tr_body.appendChild(subtotalTD)

        let totalTD=document.createElement('td')
        totalTD.style.fontSize="12px"
        totalTD.style.border="1px solid #000"
        totalTD.style.padding="0 2px 0 2px"
        totalTD.appendChild(document.createTextNode(numeral(_.round(item.total,2)).format('0,0[.]00')))
        tr_body.appendChild(totalTD)

        tbody.appendChild(tr_body)
        })

        let total_= numeral(
              lst_pagos.value
                .map(item => item.total)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00")

        let subtotal_= numeral(
              lst_pagos.value
                .map(item => item.subtotal)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00")
           let descuento = numeral(
              lst_pagos.value
                .map(item => item.descuento)
                .reduce((red, val) => red + parseFloat(_.isNull(val)?0:val), 0)
            ).format("0,0[.]00")

      let tr_tfoot=document.createElement('tr')

      

      let th_foot=document.createElement('th')
      th_foot.colSpan=2
 
      let th_foot0=document.createElement('th')
      th_foot0.style.fontSize="14px"
      th_foot0.style.border="1px solid #000"
      th_foot0.style.padding="0 2px 0 2px"
      th_foot0.appendChild(document.createTextNode(descuento))
  

      let th_foot1=document.createElement('th')
      th_foot1.style.fontSize="14px"
      th_foot1.style.border="1px solid #000"
      th_foot1.style.padding="0 2px 0 2px"
      th_foot1.appendChild(document.createTextNode(subtotal_))

      let th_foot2=document.createElement('th')
      th_foot2.style.fontSize="14px"
      th_foot2.style.border="1px solid #000"
      th_foot2.style.padding="0 2px 0 2px"
      th_foot2.appendChild(document.createTextNode(total_))

      tr_tfoot.appendChild(th_foot)
      tr_tfoot.appendChild(th_foot0)
      tr_tfoot.appendChild(th_foot1)
      tr_tfoot.appendChild(th_foot2)
      
      tfoot.appendChild(tr_tfoot)
      
      table.appendChild(tbody)
      table.appendChild(tfoot)

      reporte.appendChild(table)

      let pagos =document.createElement('div')
      pagos.style.marginTop="15px"
      pagos.appendChild(document.createTextNode(`Efectivo: ${numeral(efectivo.value).format("0,0[.]0")} | T.Crédito: ${numeral(credito.value).format("0,0[.]0")} | T.Debito: ${numeral(debito.value).format("0,0[.]0")} | Cheque: ${numeral(cheque.value).format("0,0[.]0")} | Transferencia: ${numeral(transferencia.value).format("0,0[.]0")}`))
      
      reporte.appendChild(pagos)

      
      printJS({printable:reporte.innerHTML,type:'raw-html',style:'th:{background:#d1d1d1}'});
    }
    function  exportar() {
      let wb = XLSX.utils.book_new();
      wb.SheetNames.push("pagos_agrupados");
      let ws_data1 = lst_pagos.value.map(item => [
        item.cve_cuota,
        item.descripcion,
        item.cantidad,
        parseFloat(item.monto),
        parseFloat(item.descuento),
        parseFloat(item.total)
      ]);
      
      let ws_data=_.concat([['Clave','Concepto','Cantidad Cobros','Monto',
      'Descuento','Total']],ws_data1);

      console.log(ws_data)
      let ws = XLSX.utils.aoa_to_sheet(ws_data, {origin: "B2"});

      wb.Sheets["pagos_agrupados"] = ws;

      let wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

      function s2ab(s) {
        let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        let view = new Uint8Array(buf); //create uint8array as viewer
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
        return buf;
      }

      saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');

    }
    function generar() {
      const pdf = new jsPDF();

      pdf.text("Reporte de Corte Caja", 100, 10, null, null, "center");
      pdf.setFontSize(10);
      pdf.text(`perido ${dayjs(date.value).format('DD-MM-YYYY')} al ${dayjs(date2.value).format('DD-MM-YYYY')} | cajero(a): ${cajeroText.value}`, 100, 15, null, null, "center");
      let bandera = 0;
      pdf.autoTable({
        theme: "grid",
        margin: { left: 5, right: 5,top:20 },
        headStyles: { fillColor: [115, 115, 115], cellWidth: "wrap" },
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        columnStyles: {
          total: { fillColor: [115, 115, 115], textColor: [255, 255, 255] }
        },
        columns: [
          { header: "Concepto", dataKey: "descripcion" },
          { header: "Descuento", dataKey: "descuento" },
          { header: "Subtotal", dataKey: "subtotal" },
          // { header: "Iva", dataKey: "iva" },
          { header: "Cantidad", dataKey: "cantidad" },
          { header: "Total", dataKey: "total" }
        ],
        body: lst_pagos.value.map(item => ({
          descripcion: item.descripcion,
          descuento: numeral(item.descuento).format("0,0[.]00"),
          subtotal: numeral(item.subtotal).format("0,0[.]00"),
          // iva: numeral(item.iva).format("0,0[.]00"),
          cantidad: item.cantidad,
          total: numeral(item.total).format("0,0[.]00")
        })),
        foot: [
          {
            total: numeral(
              lst_pagos.value
                .map(item => item.total)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00"),
            subtotal: numeral(
              lst_pagos.value
                .map(item => item.subtotal)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00"),
            descuento: numeral(
              lst_pagos.value
                .map(item => item.descuento)
                .reduce((red, val) => red + parseFloat(_.isNull(val)?0:val), 0)
            ).format("0,0[.]00"),
            // iva: numeral(
            //   this.lst_pagos
            //     .map(item => item.iva)
            //     .reduce((red, val) => red + parseFloat(val), 0)
            // ).format("0,0[.]00")
          },
        ],
      });

      pdf.autoTable({
        theme: "grid",
        margin: { left: 5, right: 5 },
        headStyles: { fillColor: [115, 115, 115], cellWidth: "wrap" },
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        head:[{content: `Efectivo: ${numeral(efectivo.value).format("0,0[.]0")} | T.Crédito: ${numeral(credito.value).format("0,0[.]0")} | T.Debito: ${numeral(debito.value).format("0,0[.]0")} | Cheque: ${numeral(cheque.value).format("0,0[.]0")} | Transferencia: ${numeral(transferencia.value).format("0,0[.]0")}`}]
      });

      pdf.save("reporte_pagos.pdf");
    }
  
  function close()
  {
    window.electron.closeReportePagosAgrupados()
  }
  

  function minimizar()
  {
    window.electron.miniReportePagosAgrupados()
  }

    
</script>

<style>
</style>