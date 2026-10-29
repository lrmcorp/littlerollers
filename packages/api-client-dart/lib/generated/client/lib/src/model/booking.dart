//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/booking_branch.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/session_duration_minutes.dart';
import 'package:openapi/src/model/booking_class_slot.dart';
import 'package:openapi/src/model/booking_attendance.dart';
import 'package:openapi/src/model/booking_customer.dart';
import 'package:openapi/src/model/booking_session_balance.dart';
import 'package:openapi/src/model/voucher_packages_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'booking.g.dart';

/// Booking
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [classSlotId] 
/// * [customerUserId] 
/// * [customerPackageId] 
/// * [reservationId] 
/// * [createdById] 
/// * [source_] 
/// * [status] 
/// * [reservedQuantity] 
/// * [sessionDurationMinutes] 
/// * [cancellationReasonCode] 
/// * [cancelledAt] 
/// * [createdAt] 
/// * [version] 
/// * [idempotentReplay] 
/// * [customer] 
/// * [sessionBalance] 
/// * [branch] 
/// * [classSlot] 
/// * [package] 
/// * [attendance] 
@BuiltValue()
abstract class Booking implements Built<Booking, BookingBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classSlotId')
  String get classSlotId;

  @BuiltValueField(wireName: r'customerUserId')
  String get customerUserId;

  @BuiltValueField(wireName: r'customerPackageId')
  String get customerPackageId;

  @BuiltValueField(wireName: r'reservationId')
  String get reservationId;

  @BuiltValueField(wireName: r'createdById')
  String get createdById;

  @BuiltValueField(wireName: r'source')
  BookingSource_Enum get source_;
  // enum source_Enum {  SELF,  ADMIN_ASSISTED,  };

  @BuiltValueField(wireName: r'status')
  BookingStatusEnum get status;
  // enum statusEnum {  BOOKED,  RESCHEDULE_PENDING,  CANCELLED,  ATTENDED,  NO_SHOW,  };

  @BuiltValueField(wireName: r'reservedQuantity')
  BookingReservedQuantityEnum get reservedQuantity;
  // enum reservedQuantityEnum {  1,  };

  @BuiltValueField(wireName: r'sessionDurationMinutes')
  SessionDurationMinutes? get sessionDurationMinutes;
  // enum sessionDurationMinutesEnum {  60,  120,  };

  @BuiltValueField(wireName: r'cancellationReasonCode')
  BookingCancellationReasonCodeEnum? get cancellationReasonCode;
  // enum cancellationReasonCodeEnum {  PERSONAL_UNAVAILABLE,  CUSTOMER_SCHEDULE_CONFLICT,  WRONG_CLASS_SELECTED,  OTHER,  ,  };

  @BuiltValueField(wireName: r'cancelledAt')
  DateTime? get cancelledAt;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'idempotentReplay')
  bool get idempotentReplay;

  @BuiltValueField(wireName: r'customer')
  BookingCustomer? get customer;

  @BuiltValueField(wireName: r'sessionBalance')
  BookingSessionBalance? get sessionBalance;

  @BuiltValueField(wireName: r'branch')
  BookingBranch? get branch;

  @BuiltValueField(wireName: r'classSlot')
  BookingClassSlot? get classSlot;

  @BuiltValueField(wireName: r'package')
  VoucherPackagesInner? get package;

  @BuiltValueField(wireName: r'attendance')
  BookingAttendance? get attendance;

  Booking._();

  factory Booking([void updates(BookingBuilder b)]) = _$Booking;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BookingBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Booking> get serializer => _$BookingSerializer();
}

class _$BookingSerializer implements PrimitiveSerializer<Booking> {
  @override
  final Iterable<Type> types = const [Booking, _$Booking];

  @override
  final String wireName = r'Booking';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Booking object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classSlotId';
    yield serializers.serialize(
      object.classSlotId,
      specifiedType: const FullType(String),
    );
    yield r'customerUserId';
    yield serializers.serialize(
      object.customerUserId,
      specifiedType: const FullType(String),
    );
    yield r'customerPackageId';
    yield serializers.serialize(
      object.customerPackageId,
      specifiedType: const FullType(String),
    );
    yield r'reservationId';
    yield serializers.serialize(
      object.reservationId,
      specifiedType: const FullType(String),
    );
    yield r'createdById';
    yield serializers.serialize(
      object.createdById,
      specifiedType: const FullType(String),
    );
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(BookingSource_Enum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(BookingStatusEnum),
    );
    yield r'reservedQuantity';
    yield serializers.serialize(
      object.reservedQuantity,
      specifiedType: const FullType(BookingReservedQuantityEnum),
    );
    if (object.sessionDurationMinutes != null) {
      yield r'sessionDurationMinutes';
      yield serializers.serialize(
        object.sessionDurationMinutes,
        specifiedType: const FullType(SessionDurationMinutes),
      );
    }
    if (object.cancellationReasonCode != null) {
      yield r'cancellationReasonCode';
      yield serializers.serialize(
        object.cancellationReasonCode,
        specifiedType: const FullType.nullable(BookingCancellationReasonCodeEnum),
      );
    }
    if (object.cancelledAt != null) {
      yield r'cancelledAt';
      yield serializers.serialize(
        object.cancelledAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'idempotentReplay';
    yield serializers.serialize(
      object.idempotentReplay,
      specifiedType: const FullType(bool),
    );
    if (object.customer != null) {
      yield r'customer';
      yield serializers.serialize(
        object.customer,
        specifiedType: const FullType(BookingCustomer),
      );
    }
    if (object.sessionBalance != null) {
      yield r'sessionBalance';
      yield serializers.serialize(
        object.sessionBalance,
        specifiedType: const FullType(BookingSessionBalance),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(BookingBranch),
      );
    }
    if (object.classSlot != null) {
      yield r'classSlot';
      yield serializers.serialize(
        object.classSlot,
        specifiedType: const FullType(BookingClassSlot),
      );
    }
    if (object.package != null) {
      yield r'package';
      yield serializers.serialize(
        object.package,
        specifiedType: const FullType(VoucherPackagesInner),
      );
    }
    if (object.attendance != null) {
      yield r'attendance';
      yield serializers.serialize(
        object.attendance,
        specifiedType: const FullType(BookingAttendance),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Booking object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BookingBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classSlotId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classSlotId = valueDes;
          break;
        case r'customerUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerUserId = valueDes;
          break;
        case r'customerPackageId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerPackageId = valueDes;
          break;
        case r'reservationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reservationId = valueDes;
          break;
        case r'createdById':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.createdById = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingSource_Enum),
          ) as BookingSource_Enum;
          result.source_ = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingStatusEnum),
          ) as BookingStatusEnum;
          result.status = valueDes;
          break;
        case r'reservedQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingReservedQuantityEnum),
          ) as BookingReservedQuantityEnum;
          result.reservedQuantity = valueDes;
          break;
        case r'sessionDurationMinutes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionDurationMinutes),
          ) as SessionDurationMinutes;
          result.sessionDurationMinutes = valueDes;
          break;
        case r'cancellationReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BookingCancellationReasonCodeEnum),
          ) as BookingCancellationReasonCodeEnum?;
          if (valueDes == null) continue;
          result.cancellationReasonCode = valueDes;
          break;
        case r'cancelledAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.cancelledAt = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'idempotentReplay':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.idempotentReplay = valueDes;
          break;
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingCustomer),
          ) as BookingCustomer;
          result.customer.replace(valueDes);
          break;
        case r'sessionBalance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingSessionBalance),
          ) as BookingSessionBalance;
          result.sessionBalance.replace(valueDes);
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingBranch),
          ) as BookingBranch;
          result.branch.replace(valueDes);
          break;
        case r'classSlot':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingClassSlot),
          ) as BookingClassSlot;
          result.classSlot.replace(valueDes);
          break;
        case r'package':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherPackagesInner),
          ) as VoucherPackagesInner;
          result.package.replace(valueDes);
          break;
        case r'attendance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BookingAttendance),
          ) as BookingAttendance;
          result.attendance.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Booking deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BookingBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class BookingSource_Enum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SELF')
  static const BookingSource_Enum SELF = _$bookingSourceEnum_SELF;
  @BuiltValueEnumConst(wireName: r'ADMIN_ASSISTED')
  static const BookingSource_Enum ADMIN_ASSISTED = _$bookingSourceEnum_ADMIN_ASSISTED;

  static Serializer<BookingSource_Enum> get serializer => _$bookingSourceEnumSerializer;

  const BookingSource_Enum._(String name): super(name);

  static BuiltSet<BookingSource_Enum> get values => _$bookingSourceEnumValues;
  static BookingSource_Enum valueOf(String name) => _$bookingSourceEnumValueOf(name);
}

class BookingStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BOOKED')
  static const BookingStatusEnum BOOKED = _$bookingStatusEnum_BOOKED;
  @BuiltValueEnumConst(wireName: r'RESCHEDULE_PENDING')
  static const BookingStatusEnum RESCHEDULE_PENDING = _$bookingStatusEnum_RESCHEDULE_PENDING;
  @BuiltValueEnumConst(wireName: r'CANCELLED')
  static const BookingStatusEnum CANCELLED = _$bookingStatusEnum_CANCELLED;
  @BuiltValueEnumConst(wireName: r'ATTENDED')
  static const BookingStatusEnum ATTENDED = _$bookingStatusEnum_ATTENDED;
  @BuiltValueEnumConst(wireName: r'NO_SHOW')
  static const BookingStatusEnum NO_SHOW = _$bookingStatusEnum_NO_SHOW;

  static Serializer<BookingStatusEnum> get serializer => _$bookingStatusEnumSerializer;

  const BookingStatusEnum._(String name): super(name);

  static BuiltSet<BookingStatusEnum> get values => _$bookingStatusEnumValues;
  static BookingStatusEnum valueOf(String name) => _$bookingStatusEnumValueOf(name);
}

class BookingReservedQuantityEnum extends EnumClass {

  @BuiltValueEnumConst(wireNumber: 1)
  static const BookingReservedQuantityEnum number1 = _$bookingReservedQuantityEnum_number1;

  static Serializer<BookingReservedQuantityEnum> get serializer => _$bookingReservedQuantityEnumSerializer;

  const BookingReservedQuantityEnum._(String name): super(name);

  static BuiltSet<BookingReservedQuantityEnum> get values => _$bookingReservedQuantityEnumValues;
  static BookingReservedQuantityEnum valueOf(String name) => _$bookingReservedQuantityEnumValueOf(name);
}

class BookingCancellationReasonCodeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERSONAL_UNAVAILABLE')
  static const BookingCancellationReasonCodeEnum PERSONAL_UNAVAILABLE = _$bookingCancellationReasonCodeEnum_PERSONAL_UNAVAILABLE;
  @BuiltValueEnumConst(wireName: r'CUSTOMER_SCHEDULE_CONFLICT')
  static const BookingCancellationReasonCodeEnum CUSTOMER_SCHEDULE_CONFLICT = _$bookingCancellationReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
  @BuiltValueEnumConst(wireName: r'WRONG_CLASS_SELECTED')
  static const BookingCancellationReasonCodeEnum WRONG_CLASS_SELECTED = _$bookingCancellationReasonCodeEnum_WRONG_CLASS_SELECTED;
  @BuiltValueEnumConst(wireName: r'OTHER')
  static const BookingCancellationReasonCodeEnum OTHER = _$bookingCancellationReasonCodeEnum_OTHER;

  static Serializer<BookingCancellationReasonCodeEnum> get serializer => _$bookingCancellationReasonCodeEnumSerializer;

  const BookingCancellationReasonCodeEnum._(String name): super(name);

  static BuiltSet<BookingCancellationReasonCodeEnum> get values => _$bookingCancellationReasonCodeEnumValues;
  static BookingCancellationReasonCodeEnum valueOf(String name) => _$bookingCancellationReasonCodeEnumValueOf(name);
}

