// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const BookingCommandSource_Enum _$bookingCommandSourceEnum_SELF =
    const BookingCommandSource_Enum._('SELF');
const BookingCommandSource_Enum _$bookingCommandSourceEnum_ADMIN_ASSISTED =
    const BookingCommandSource_Enum._('ADMIN_ASSISTED');

BookingCommandSource_Enum _$bookingCommandSourceEnumValueOf(String name) {
  switch (name) {
    case 'SELF':
      return _$bookingCommandSourceEnum_SELF;
    case 'ADMIN_ASSISTED':
      return _$bookingCommandSourceEnum_ADMIN_ASSISTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BookingCommandSource_Enum> _$bookingCommandSourceEnumValues =
    BuiltSet<BookingCommandSource_Enum>(const <BookingCommandSource_Enum>[
      _$bookingCommandSourceEnum_SELF,
      _$bookingCommandSourceEnum_ADMIN_ASSISTED,
    ]);

Serializer<BookingCommandSource_Enum> _$bookingCommandSourceEnumSerializer =
    _$BookingCommandSource_EnumSerializer();

class _$BookingCommandSource_EnumSerializer
    implements PrimitiveSerializer<BookingCommandSource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SELF': 'SELF',
    'ADMIN_ASSISTED': 'ADMIN_ASSISTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SELF': 'SELF',
    'ADMIN_ASSISTED': 'ADMIN_ASSISTED',
  };

  @override
  final Iterable<Type> types = const <Type>[BookingCommandSource_Enum];
  @override
  final String wireName = 'BookingCommandSource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    BookingCommandSource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BookingCommandSource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BookingCommandSource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$BookingCommand extends BookingCommand {
  @override
  final String classSlotId;
  @override
  final String customerPackageId;
  @override
  final String? customerUserId;
  @override
  final BookingCommandSource_Enum source_;

  factory _$BookingCommand([void Function(BookingCommandBuilder)? updates]) =>
      (BookingCommandBuilder()..update(updates))._build();

  _$BookingCommand._({
    required this.classSlotId,
    required this.customerPackageId,
    this.customerUserId,
    required this.source_,
  }) : super._();
  @override
  BookingCommand rebuild(void Function(BookingCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingCommandBuilder toBuilder() => BookingCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingCommand &&
        classSlotId == other.classSlotId &&
        customerPackageId == other.customerPackageId &&
        customerUserId == other.customerUserId &&
        source_ == other.source_;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingCommand')
          ..add('classSlotId', classSlotId)
          ..add('customerPackageId', customerPackageId)
          ..add('customerUserId', customerUserId)
          ..add('source_', source_))
        .toString();
  }
}

class BookingCommandBuilder
    implements Builder<BookingCommand, BookingCommandBuilder> {
  _$BookingCommand? _$v;

  String? _classSlotId;
  String? get classSlotId => _$this._classSlotId;
  set classSlotId(String? classSlotId) => _$this._classSlotId = classSlotId;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  String? _customerUserId;
  String? get customerUserId => _$this._customerUserId;
  set customerUserId(String? customerUserId) =>
      _$this._customerUserId = customerUserId;

  BookingCommandSource_Enum? _source_;
  BookingCommandSource_Enum? get source_ => _$this._source_;
  set source_(BookingCommandSource_Enum? source_) => _$this._source_ = source_;

  BookingCommandBuilder() {
    BookingCommand._defaults(this);
  }

  BookingCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classSlotId = $v.classSlotId;
      _customerPackageId = $v.customerPackageId;
      _customerUserId = $v.customerUserId;
      _source_ = $v.source_;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingCommand other) {
    _$v = other as _$BookingCommand;
  }

  @override
  void update(void Function(BookingCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingCommand build() => _build();

  _$BookingCommand _build() {
    final _$result =
        _$v ??
        _$BookingCommand._(
          classSlotId: BuiltValueNullFieldError.checkNotNull(
            classSlotId,
            r'BookingCommand',
            'classSlotId',
          ),
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'BookingCommand',
            'customerPackageId',
          ),
          customerUserId: customerUserId,
          source_: BuiltValueNullFieldError.checkNotNull(
            source_,
            r'BookingCommand',
            'source_',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
