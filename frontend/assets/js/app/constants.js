const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const HOST="http://localhost:3000/api_v1";
const HOST_VIEWS="http://localhost:3000/views";

// URLs para todos los módulos

const URL_STATUS=HOST+"/statuses";
const URL_ROLE=HOST+"/roles";
const URL_USER=HOST+"/user";
const URL_MODULE=HOST+"/module";
const URL_TOKEN=HOST+"/token";
const URL_PROPERTY=HOST+"/properties";
const URL_VEHICLE=HOST+"/vehicles";
const URL_PARKINGSLOT=HOST+"/parking-slots";
const URL_PARKINGZONE=HOST+"/parking-zones";
const URL_AMENITY=HOST+"/amenities";
const URL_RESERVATION=HOST+"/reservations";
const URL_VISITOR=HOST+"/visitors";
const URL_CPCG=HOST+"/cpcg";
const URL_CPCG_TYPE=HOST+"/cpcg-types";
const URL_INVOICE=HOST+"/invoice";
const URL_PAYMENT=HOST+"/payments";
const URL_TARIFF=HOST+"/tariffs";
const URL_NOTIFICATION=HOST+"/notifications";
const URL_NOTIFICATION_TYPE=HOST+"/notificationType";
const URL_AMENITY_TYPE=HOST+"/amenity-types";
const URL_REPORT=HOST+"/reports";
const URL_REPORT_TYPE=HOST+"/report-types";
const URL_LOGIN=HOST+"/login";
const URL_PROFILE=HOST+"/profiles";
const URL_PACKAGE=HOST+"/packages/";
const URL_PARKINGASSIGNMENT=HOST+"/parking-assignments/";
const URL_PARKINGLOTTERY=HOST+"/parking-lotteries/";
const URL_PASSWORD_RESET=HOST+"/password-reset/request";
const URL_PASSWORD_VALIDATE=HOST+"/password-reset/validate";
const URL_PASSWORD_RESET_CONFIRM=HOST+"/password-reset/reset";

// URLs para exportación de reportes PDF
const URL_EXPORT_USERS=HOST+"/export/users";
const URL_EXPORT_PROPERTIES=HOST+"/export/properties";
const URL_EXPORT_VEHICLES=HOST+"/export/vehicles";
const URL_EXPORT_RESERVATIONS=HOST+"/export/reservations";
const URL_EXPORT_NOTIFICATIONS=HOST+"/export/notifications";
const URL_EXPORT_VISITORS=HOST+"/export/visitors";
const URL_EXPORT_INVOICES=HOST+"/export/invoices";
const URL_EXPORT_PROFILES=HOST+"/export/profiles";
const URL_EXPORT_PARKING=HOST+"/export/parking";
const URL_EXPORT_ASSIGNMENTS=HOST+"/export/assignments";
const URL_EXPORT_LOTTERIES=HOST+"/export/lotteries";
const URL_EXPORT_PARKINGZONES=HOST+"/export/parking-zones";
const URL_EXPORT_AMENITIES=HOST+"/export/amenities";

// URLs para exportación de reportes Excel
const URL_EXPORT_USERS_EXCEL=HOST+"/export/users/excel";
const URL_EXPORT_PROPERTIES_EXCEL=HOST+"/export/properties/excel";
const URL_EXPORT_VEHICLES_EXCEL=HOST+"/export/vehicles/excel";
const URL_EXPORT_NOTIFICATIONS_EXCEL=HOST+"/export/notifications/excel";
const URL_EXPORT_PARKING_EXCEL=HOST+"/export/parking/excel";
const URL_EXPORT_PROFILES_EXCEL=HOST+"/export/profiles/excel";
const URL_EXPORT_ASSIGNMENTS_EXCEL=HOST+"/export/assignments/excel";
const URL_EXPORT_LOTTERIES_EXCEL=HOST+"/export/lotteries/excel";
const URL_EXPORT_PARKINGZONES_EXCEL=HOST+"/export/parking-zones/excel";
const URL_EXPORT_VISITORS_EXCEL=HOST+"/export/visitors/excel";
const URL_EXPORT_AMENITIES_EXCEL=HOST+"/export/amenities/excel";
const URL_EXPORT_RESERVATIONS_EXCEL=HOST+"/export/reservations/excel";

const KEY_TOKEN="token-app";


