// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_notification.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserNotificationCategoryEnum _$userNotificationCategoryEnum_VERIFICATION =
    const UserNotificationCategoryEnum._('VERIFICATION');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_PAYMENT =
    const UserNotificationCategoryEnum._('PAYMENT');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_PACKAGE =
    const UserNotificationCategoryEnum._('PACKAGE');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_BOOKING =
    const UserNotificationCategoryEnum._('BOOKING');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_RESCHEDULE =
    const UserNotificationCategoryEnum._('RESCHEDULE');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_CLASS =
    const UserNotificationCategoryEnum._('CLASS');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_ATTENDANCE =
    const UserNotificationCategoryEnum._('ATTENDANCE');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_ADJUSTMENT =
    const UserNotificationCategoryEnum._('ADJUSTMENT');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_OPERATIONS =
    const UserNotificationCategoryEnum._('OPERATIONS');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_APPROVAL =
    const UserNotificationCategoryEnum._('APPROVAL');
const UserNotificationCategoryEnum _$userNotificationCategoryEnum_SYSTEM =
    const UserNotificationCategoryEnum._('SYSTEM');

UserNotificationCategoryEnum _$userNotificationCategoryEnumValueOf(
  String name,
) {
  switch (name) {
    case 'VERIFICATION':
      return _$userNotificationCategoryEnum_VERIFICATION;
    case 'PAYMENT':
      return _$userNotificationCategoryEnum_PAYMENT;
    case 'PACKAGE':
      return _$userNotificationCategoryEnum_PACKAGE;
    case 'BOOKING':
      return _$userNotificationCategoryEnum_BOOKING;
    case 'RESCHEDULE':
      return _$userNotificationCategoryEnum_RESCHEDULE;
    case 'CLASS':
      return _$userNotificationCategoryEnum_CLASS;
    case 'ATTENDANCE':
      return _$userNotificationCategoryEnum_ATTENDANCE;
    case 'ADJUSTMENT':
      return _$userNotificationCategoryEnum_ADJUSTMENT;
    case 'OPERATIONS':
      return _$userNotificationCategoryEnum_OPERATIONS;
    case 'APPROVAL':
      return _$userNotificationCategoryEnum_APPROVAL;
    case 'SYSTEM':
      return _$userNotificationCategoryEnum_SYSTEM;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserNotificationCategoryEnum>
_$userNotificationCategoryEnumValues =
    BuiltSet<UserNotificationCategoryEnum>(const <UserNotificationCategoryEnum>[
      _$userNotificationCategoryEnum_VERIFICATION,
      _$userNotificationCategoryEnum_PAYMENT,
      _$userNotificationCategoryEnum_PACKAGE,
      _$userNotificationCategoryEnum_BOOKING,
      _$userNotificationCategoryEnum_RESCHEDULE,
      _$userNotificationCategoryEnum_CLASS,
      _$userNotificationCategoryEnum_ATTENDANCE,
      _$userNotificationCategoryEnum_ADJUSTMENT,
      _$userNotificationCategoryEnum_OPERATIONS,
      _$userNotificationCategoryEnum_APPROVAL,
      _$userNotificationCategoryEnum_SYSTEM,
    ]);

const UserNotificationToneEnum _$userNotificationToneEnum_success =
    const UserNotificationToneEnum._('success');
const UserNotificationToneEnum _$userNotificationToneEnum_info =
    const UserNotificationToneEnum._('info');
const UserNotificationToneEnum _$userNotificationToneEnum_warning =
    const UserNotificationToneEnum._('warning');
const UserNotificationToneEnum _$userNotificationToneEnum_danger =
    const UserNotificationToneEnum._('danger');

UserNotificationToneEnum _$userNotificationToneEnumValueOf(String name) {
  switch (name) {
    case 'success':
      return _$userNotificationToneEnum_success;
    case 'info':
      return _$userNotificationToneEnum_info;
    case 'warning':
      return _$userNotificationToneEnum_warning;
    case 'danger':
      return _$userNotificationToneEnum_danger;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserNotificationToneEnum> _$userNotificationToneEnumValues =
    BuiltSet<UserNotificationToneEnum>(const <UserNotificationToneEnum>[
      _$userNotificationToneEnum_success,
      _$userNotificationToneEnum_info,
      _$userNotificationToneEnum_warning,
      _$userNotificationToneEnum_danger,
    ]);

Serializer<UserNotificationCategoryEnum>
_$userNotificationCategoryEnumSerializer =
    _$UserNotificationCategoryEnumSerializer();
Serializer<UserNotificationToneEnum> _$userNotificationToneEnumSerializer =
    _$UserNotificationToneEnumSerializer();

class _$UserNotificationCategoryEnumSerializer
    implements PrimitiveSerializer<UserNotificationCategoryEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'VERIFICATION': 'VERIFICATION',
    'PAYMENT': 'PAYMENT',
    'PACKAGE': 'PACKAGE',
    'BOOKING': 'BOOKING',
    'RESCHEDULE': 'RESCHEDULE',
    'CLASS': 'CLASS',
    'ATTENDANCE': 'ATTENDANCE',
    'ADJUSTMENT': 'ADJUSTMENT',
    'OPERATIONS': 'OPERATIONS',
    'APPROVAL': 'APPROVAL',
    'SYSTEM': 'SYSTEM',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'VERIFICATION': 'VERIFICATION',
    'PAYMENT': 'PAYMENT',
    'PACKAGE': 'PACKAGE',
    'BOOKING': 'BOOKING',
    'RESCHEDULE': 'RESCHEDULE',
    'CLASS': 'CLASS',
    'ATTENDANCE': 'ATTENDANCE',
    'ADJUSTMENT': 'ADJUSTMENT',
    'OPERATIONS': 'OPERATIONS',
    'APPROVAL': 'APPROVAL',
    'SYSTEM': 'SYSTEM',
  };

  @override
  final Iterable<Type> types = const <Type>[UserNotificationCategoryEnum];
  @override
  final String wireName = 'UserNotificationCategoryEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserNotificationCategoryEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserNotificationCategoryEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserNotificationCategoryEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserNotificationToneEnumSerializer
    implements PrimitiveSerializer<UserNotificationToneEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'success': 'success',
    'info': 'info',
    'warning': 'warning',
    'danger': 'danger',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'success': 'success',
    'info': 'info',
    'warning': 'warning',
    'danger': 'danger',
  };

  @override
  final Iterable<Type> types = const <Type>[UserNotificationToneEnum];
  @override
  final String wireName = 'UserNotificationToneEnum';

  @override
  Object serialize(
    Serializers serializers,
    UserNotificationToneEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  UserNotificationToneEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => UserNotificationToneEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$UserNotification extends UserNotification {
  @override
  final String id;
  @override
  final UserNotificationCategoryEnum category;
  @override
  final UserNotificationToneEnum tone;
  @override
  final String title;
  @override
  final String message;
  @override
  final String? href;
  @override
  final String? branchId;
  @override
  final JsonObject? metadataMasked;
  @override
  final DateTime? readAt;
  @override
  final DateTime? expiresAt;
  @override
  final DateTime createdAt;

  factory _$UserNotification([
    void Function(UserNotificationBuilder)? updates,
  ]) => (UserNotificationBuilder()..update(updates))._build();

  _$UserNotification._({
    required this.id,
    required this.category,
    required this.tone,
    required this.title,
    required this.message,
    this.href,
    this.branchId,
    this.metadataMasked,
    this.readAt,
    this.expiresAt,
    required this.createdAt,
  }) : super._();
  @override
  UserNotification rebuild(void Function(UserNotificationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UserNotificationBuilder toBuilder() =>
      UserNotificationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UserNotification &&
        id == other.id &&
        category == other.category &&
        tone == other.tone &&
        title == other.title &&
        message == other.message &&
        href == other.href &&
        branchId == other.branchId &&
        metadataMasked == other.metadataMasked &&
        readAt == other.readAt &&
        expiresAt == other.expiresAt &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, tone.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, href.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, metadataMasked.hashCode);
    _$hash = $jc(_$hash, readAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UserNotification')
          ..add('id', id)
          ..add('category', category)
          ..add('tone', tone)
          ..add('title', title)
          ..add('message', message)
          ..add('href', href)
          ..add('branchId', branchId)
          ..add('metadataMasked', metadataMasked)
          ..add('readAt', readAt)
          ..add('expiresAt', expiresAt)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class UserNotificationBuilder
    implements Builder<UserNotification, UserNotificationBuilder> {
  _$UserNotification? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  UserNotificationCategoryEnum? _category;
  UserNotificationCategoryEnum? get category => _$this._category;
  set category(UserNotificationCategoryEnum? category) =>
      _$this._category = category;

  UserNotificationToneEnum? _tone;
  UserNotificationToneEnum? get tone => _$this._tone;
  set tone(UserNotificationToneEnum? tone) => _$this._tone = tone;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _href;
  String? get href => _$this._href;
  set href(String? href) => _$this._href = href;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  JsonObject? _metadataMasked;
  JsonObject? get metadataMasked => _$this._metadataMasked;
  set metadataMasked(JsonObject? metadataMasked) =>
      _$this._metadataMasked = metadataMasked;

  DateTime? _readAt;
  DateTime? get readAt => _$this._readAt;
  set readAt(DateTime? readAt) => _$this._readAt = readAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  UserNotificationBuilder() {
    UserNotification._defaults(this);
  }

  UserNotificationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _category = $v.category;
      _tone = $v.tone;
      _title = $v.title;
      _message = $v.message;
      _href = $v.href;
      _branchId = $v.branchId;
      _metadataMasked = $v.metadataMasked;
      _readAt = $v.readAt;
      _expiresAt = $v.expiresAt;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UserNotification other) {
    _$v = other as _$UserNotification;
  }

  @override
  void update(void Function(UserNotificationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UserNotification build() => _build();

  _$UserNotification _build() {
    final _$result =
        _$v ??
        _$UserNotification._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'UserNotification',
            'id',
          ),
          category: BuiltValueNullFieldError.checkNotNull(
            category,
            r'UserNotification',
            'category',
          ),
          tone: BuiltValueNullFieldError.checkNotNull(
            tone,
            r'UserNotification',
            'tone',
          ),
          title: BuiltValueNullFieldError.checkNotNull(
            title,
            r'UserNotification',
            'title',
          ),
          message: BuiltValueNullFieldError.checkNotNull(
            message,
            r'UserNotification',
            'message',
          ),
          href: href,
          branchId: branchId,
          metadataMasked: metadataMasked,
          readAt: readAt,
          expiresAt: expiresAt,
          createdAt: BuiltValueNullFieldError.checkNotNull(
            createdAt,
            r'UserNotification',
            'createdAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
